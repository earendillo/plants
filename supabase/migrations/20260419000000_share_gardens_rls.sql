-- Share gardens: membership + share links + RLS + RPC helpers

-- 0) Ensure required extensions (gen_random_uuid used in existing migrations)
-- (Usually already present in Supabase projects; keep migrations tolerant.)

-- 1) Sharing tables
create table if not exists garden_members (
  garden_id uuid not null references gardens(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('limited_editor')),
  created_at timestamptz not null default now(),
  primary key (garden_id, user_id)
);

alter table garden_members enable row level security;

create table if not exists garden_share_links (
  id uuid primary key default gen_random_uuid(),
  garden_id uuid not null references gardens(id) on delete cascade,
  token text not null unique,
  role text not null default 'limited_editor' check (role in ('limited_editor')),
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  revoked_at timestamptz null,
  expires_at timestamptz null
);

alter table garden_share_links enable row level security;

-- 2) Gardens RLS
alter table gardens enable row level security;

drop policy if exists "Gardens readable by owner or members" on gardens;
create policy "Gardens readable by owner or members"
on gardens for select
using (
  owner_id = auth.uid()
  or exists (
    select 1
    from garden_members gm
    where gm.garden_id = gardens.id
      and gm.user_id = auth.uid()
  )
);

drop policy if exists "Gardens insert by owner" on gardens;
create policy "Gardens insert by owner"
on gardens for insert
with check (owner_id = auth.uid());

drop policy if exists "Gardens update by owner" on gardens;
create policy "Gardens update by owner"
on gardens for update
using (owner_id = auth.uid())
with check (owner_id = auth.uid());

drop policy if exists "Gardens delete by owner" on gardens;
create policy "Gardens delete by owner"
on gardens for delete
using (owner_id = auth.uid());

-- 3) Plants RLS (replaces single-user policy)
alter table plants enable row level security;

drop policy if exists "Users can manage own plants" on plants;
drop policy if exists "Plants readable by garden owner or members" on plants;
create policy "Plants readable by garden owner or members"
on plants for select
using (
  exists (
    select 1
    from gardens g
    where g.id = plants.garden_id
      and (
        g.owner_id = auth.uid()
        or exists (
          select 1
          from garden_members gm
          where gm.garden_id = g.id
            and gm.user_id = auth.uid()
        )
      )
  )
);

drop policy if exists "Plants insert by garden owner only" on plants;
create policy "Plants insert by garden owner only"
on plants for insert
with check (
  exists (
    select 1
    from gardens g
    where g.id = plants.garden_id
      and g.owner_id = auth.uid()
  )
  and plants.user_id = auth.uid()
);

drop policy if exists "Plants update by garden owner only" on plants;
create policy "Plants update by garden owner only"
on plants for update
using (
  exists (
    select 1
    from gardens g
    where g.id = plants.garden_id
      and g.owner_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from gardens g
    where g.id = plants.garden_id
      and g.owner_id = auth.uid()
  )
);

drop policy if exists "Plants delete by garden owner only" on plants;
create policy "Plants delete by garden owner only"
on plants for delete
using (
  exists (
    select 1
    from gardens g
    where g.id = plants.garden_id
      and g.owner_id = auth.uid()
  )
);

-- 4) Membership & share link table policies (minimal)
-- Members can see that they are members; owners can manage membership.

drop policy if exists "Garden members readable by owners and self" on garden_members;
create policy "Garden members readable by owners and self"
on garden_members for select
using (
  user_id = auth.uid()
  or exists (
    select 1 from gardens g
    where g.id = garden_members.garden_id
      and g.owner_id = auth.uid()
  )
);

drop policy if exists "Garden members insert by owners" on garden_members;
create policy "Garden members insert by owners"
on garden_members for insert
with check (
  exists (
    select 1 from gardens g
    where g.id = garden_members.garden_id
      and g.owner_id = auth.uid()
  )
);

drop policy if exists "Garden members delete by owners" on garden_members;
create policy "Garden members delete by owners"
on garden_members for delete
using (
  exists (
    select 1 from gardens g
    where g.id = garden_members.garden_id
      and g.owner_id = auth.uid()
  )
);

-- Share links: only owners can read/write links for their gardens.
drop policy if exists "Share links manageable by garden owners" on garden_share_links;
create policy "Share links manageable by garden owners"
on garden_share_links for all
using (
  exists (
    select 1 from gardens g
    where g.id = garden_share_links.garden_id
      and g.owner_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from gardens g
    where g.id = garden_share_links.garden_id
      and g.owner_id = auth.uid()
  )
);

-- 5) RPC helpers
--
-- Column-limited updates (water/feed) are implemented as SECURITY DEFINER
-- functions so "limited_editor" members can update only the allowed fields.

create or replace function water_plant(p_plant_id uuid)
returns void
language plpgsql
security definer
as $$
begin
  update plants p
  set last_watered_at = now()::text
  where p.id = p_plant_id
    and exists (
      select 1
      from gardens g
      left join garden_members gm
        on gm.garden_id = g.id
       and gm.user_id = auth.uid()
      where g.id = p.garden_id
        and (
          g.owner_id = auth.uid()
          or gm.role = 'limited_editor'
        )
    );

  if not found then
    raise exception 'Not allowed or plant not found';
  end if;
end;
$$;

create or replace function feed_plant(p_plant_id uuid)
returns void
language plpgsql
security definer
as $$
begin
  update plants p
  set last_fed_at = now()::text
  where p.id = p_plant_id
    and exists (
      select 1
      from gardens g
      left join garden_members gm
        on gm.garden_id = g.id
       and gm.user_id = auth.uid()
      where g.id = p.garden_id
        and (
          g.owner_id = auth.uid()
          or gm.role = 'limited_editor'
        )
    );

  if not found then
    raise exception 'Not allowed or plant not found';
  end if;
end;
$$;

grant execute on function water_plant(uuid) to authenticated;
grant execute on function feed_plant(uuid) to authenticated;

-- Accept share link (turn token into membership for current user)
create or replace function accept_garden_share_link(p_token text)
returns uuid
language plpgsql
security definer
as $$
declare
  v_garden_id uuid;
  v_role text;
begin
  select gsl.garden_id, gsl.role
    into v_garden_id, v_role
  from garden_share_links gsl
  where gsl.token = p_token
    and gsl.revoked_at is null
    and (gsl.expires_at is null or gsl.expires_at > now())
  limit 1;

  if v_garden_id is null then
    raise exception 'Invalid or expired token';
  end if;

  insert into garden_members (garden_id, user_id, role)
  values (v_garden_id, auth.uid(), v_role)
  on conflict (garden_id, user_id)
  do update set role = excluded.role;

  return v_garden_id;
end;
$$;

grant execute on function accept_garden_share_link(text) to authenticated;

