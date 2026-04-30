-- Activity logs: anonymous event logging for watering/feeding actions.
-- No user_id stored — privacy-focused, lean schema.

create table activity_logs (
  id uuid primary key default gen_random_uuid(),
  plant_id uuid not null references plants(id) on delete cascade,
  activity_type text not null check (activity_type in ('water', 'feed')),
  performed_at timestamptz default now()
);

create index idx_logs_plant_date on activity_logs(plant_id, performed_at desc);
alter table activity_logs enable row level security;

-- SELECT piggybacks on plants RLS: if you can see the plant, you can see its logs
create policy "Users can view logs for visible plants" on activity_logs
  for select using (exists (select 1 from plants where plants.id = activity_logs.plant_id));
