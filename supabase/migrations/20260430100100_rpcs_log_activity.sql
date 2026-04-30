-- Update all water/feed RPCs to insert into activity_logs after the UPDATE.

-- Authenticated water
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

  insert into activity_logs(plant_id, activity_type) values (p_plant_id, 'water');
end;
$$;

-- Authenticated feed
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

  insert into activity_logs(plant_id, activity_type) values (p_plant_id, 'feed');
end;
$$;

-- Guest water
create or replace function water_plant_guest(p_plant_id uuid, p_token text)
returns integer
language plpgsql
security definer
set search_path = public
set row_security = off
as $$
declare
  v_garden_id uuid;
  v_rows_updated integer;
begin
  select gsl.garden_id into v_garden_id
  from garden_share_links gsl
  where gsl.token = p_token
    and gsl.allow_anonymous = true
    and gsl.revoked_at is null
    and gsl.expires_at > now()
  limit 1;

  if v_garden_id is null then
    return 0;
  end if;

  update plants p
  set last_watered_at = now()
  where p.id = p_plant_id
    and p.garden_id = v_garden_id
    and (
      p.last_watered_at is null
      or p.last_watered_at + (p.watering_interval_days * interval '1 day') <= now()
    );

  get diagnostics v_rows_updated = row_count;

  if v_rows_updated > 0 then
    insert into activity_logs(plant_id, activity_type) values (p_plant_id, 'water');
  end if;

  return v_rows_updated;
end;
$$;

-- Guest feed
create or replace function feed_plant_guest(p_plant_id uuid, p_token text)
returns integer
language plpgsql
security definer
set search_path = public
set row_security = off
as $$
declare
  v_garden_id uuid;
  v_rows_updated integer;
begin
  select gsl.garden_id into v_garden_id
  from garden_share_links gsl
  where gsl.token = p_token
    and gsl.allow_anonymous = true
    and gsl.revoked_at is null
    and gsl.expires_at > now()
  limit 1;

  if v_garden_id is null then
    return 0;
  end if;

  update plants p
  set last_fed_at = now()
  where p.id = p_plant_id
    and p.garden_id = v_garden_id
    and (
      p.last_fed_at is null
      or p.last_fed_at + (p.feeding_interval_days * interval '1 day') <= now()
    );

  get diagnostics v_rows_updated = row_count;

  if v_rows_updated > 0 then
    insert into activity_logs(plant_id, activity_type) values (p_plant_id, 'feed');
  end if;

  return v_rows_updated;
end;
$$;
