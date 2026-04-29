-- Allow garden members to delete their own membership record (i.e. leave a garden).
-- Previously only garden owners could delete garden_members rows,
-- which silently prevented members from leaving.

drop policy if exists "Garden members delete by owners" on garden_members;
create policy "Garden members delete by owners or self"
on garden_members for delete
using (
  public.is_garden_owner(garden_members.garden_id)
  OR garden_members.user_id = auth.uid()
);
