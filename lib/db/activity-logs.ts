// lib/db/activity-logs.ts
import { ActivityLog } from '@/types'
import { createClient } from '@/lib/supabase/server'

type DbActivityLog = {
  id: string
  plant_id: string
  activity_type: 'water' | 'feed'
  performed_at: string
  performed_by_user_id: string | null
  performer: { display_name: string | null } | null
}

function toActivityLog(row: DbActivityLog): ActivityLog {
  const displayName = row.performer?.display_name ?? null
  return {
    id: row.id,
    plantId: row.plant_id,
    activityType: row.activity_type,
    performedAt: row.performed_at,
    performedByUserId: row.performed_by_user_id,
    performedByName: displayName ?? (row.performed_by_user_id ? 'User' : null),
  }
}

export async function getActivityLogs(
  plantId: string,
  limit = 10
): Promise<ActivityLog[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('activity_logs')
    .select('id, plant_id, activity_type, performed_at, performed_by_user_id, performer:profiles!performed_by_user_id(display_name)')
    .eq('plant_id', plantId)
    .order('performed_at', { ascending: false })
    .limit(limit)
  if (error) throw new Error(error.message)
  return (data as unknown as DbActivityLog[]).map(toActivityLog)
}
