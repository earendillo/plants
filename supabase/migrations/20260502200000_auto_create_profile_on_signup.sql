-- Auto-create a profiles row when a new user signs up.
-- This prevents FK violations when activity_logs.performed_by_user_id
-- references profiles(id) and the user hasn't visited the profile page yet.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into profiles (id)
  values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- Backfill: create profile rows for any existing users who don't have one.
insert into profiles (id)
select id from auth.users
where id not in (select id from profiles)
on conflict (id) do nothing;
