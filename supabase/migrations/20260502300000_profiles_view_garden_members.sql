-- Allow users to view profiles of other members in their shared gardens.
-- Without this, the activity log JOIN returns null for other users' display_name
-- because the existing SELECT policy only permits viewing your own profile.

create policy "Users can view profiles of garden co-members"
on profiles for select
using (
  id in (
    select gm.user_id
    from garden_members gm
    where gm.garden_id in (
      select gm2.garden_id
      from garden_members gm2
      where gm2.user_id = auth.uid()
    )
  )
  or id in (
    select g.owner_id
    from gardens g
    join garden_members gm on gm.garden_id = g.id
    where gm.user_id = auth.uid()
  )
);
