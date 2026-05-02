-- Track who performed each activity (authenticated user or guest).
-- NULL = anonymous guest or legacy row before this migration.

alter table activity_logs
  add column performed_by_user_id uuid
  references profiles(id) on delete set null;
