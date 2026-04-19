-- Fix water_plant and feed_plant: add set row_security = off so the
-- security definer functions bypass RLS and rely solely on their own
-- WHERE-clause authorization checks (owner or limited_editor member).
-- Without this, Supabase's postgres role (which has row_security = on)
-- triggers a nested RLS cascade that raises an unexpected PostgreSQL error.

create or replace function water_plant(p_plant_id uuid)
returns void
language plpgsql
security definer
set search_path = public
set row_security = off
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
set row_security = off
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
