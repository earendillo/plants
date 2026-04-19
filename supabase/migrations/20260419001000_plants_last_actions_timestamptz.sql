-- Convert plant last action columns to proper timestamps

-- 1) Change column types (preserve existing values where possible)
alter table plants
  alter column last_watered_at type timestamptz
  using nullif(last_watered_at, '')::timestamptz;

alter table plants
  alter column last_fed_at type timestamptz
  using nullif(last_fed_at, '')::timestamptz;

-- 2) Update RPC helpers to use now() (no casts)
create or replace function water_plant(p_plant_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'Unauthorized';
  end if;

  update plants p
  set last_watered_at = now()
  where p.id = p_plant_id
    and exists (
      select 1
      from gardens g
      where g.id = p.garden_id
        and (
          g.owner_id = auth.uid()
          or exists (
            select 1
            from garden_members gm
            where gm.garden_id = g.id
              and gm.user_id = auth.uid()
              and gm.role = 'limited_editor'
          )
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
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'Unauthorized';
  end if;

  update plants p
  set last_fed_at = now()
  where p.id = p_plant_id
    and exists (
      select 1
      from gardens g
      where g.id = p.garden_id
        and (
          g.owner_id = auth.uid()
          or exists (
            select 1
            from garden_members gm
            where gm.garden_id = g.id
              and gm.user_id = auth.uid()
              and gm.role = 'limited_editor'
          )
        )
    );

  if not found then
    raise exception 'Not allowed or plant not found';
  end if;
end;
$$;

