'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { Separator } from '@/components/ui/separator'
import { ActivityLog } from '@/types'

function formatRelativeTime(
  iso: string,
  now: number,
  t: (key: string, values?: Record<string, number>) => string
): string {
  const then = new Date(iso).getTime()
  const diffMs = now - then
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays >= 1) return t('daysAgo', { days: diffDays })
  if (diffHours >= 1) return t('hoursAgo', { hours: diffHours })
  return t('today')
}

export function ActivityTimeline({ plantId, currentUserId }: { plantId: string; currentUserId: string }) {
  const t = useTranslations('activityTimeline')
  const [logs, setLogs] = useState<ActivityLog[]>([])
  const [loading, setLoading] = useState(true)
  const [now, setNow] = useState(0)

  useEffect(() => {
    async function fetchLogs() {
      try {
        const res = await fetch(`/api/plants/${plantId}/history`)
        if (res.ok) {
          setLogs(await res.json())
        }
      } finally {
        setNow(Date.now())
        setLoading(false)
      }
    }
    fetchLogs()
  }, [plantId])

  if (loading) {
    return (
      <div className="space-y-3 animate-pulse">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="flex items-center gap-3"
            style={{ opacity: 1 - (i - 1) * 0.25 }}
          >
            <div className="h-8 w-8 rounded-full bg-white/6" />
            <div className="h-4 w-32 rounded bg-white/8" />
            <div className="ml-auto h-3 w-20 rounded bg-white/5" />
          </div>
        ))}
      </div>
    )
  }

  if (logs.length === 0) {
    return (
      <p className="text-sm text-brand-fg-dim">{t('empty')}</p>
    )
  }

  return (
    <ul className="space-y-1">
      {logs.map((log, i) => (
        <li key={log.id}>
          <div className="flex items-center gap-3 py-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/6 text-base">
              {log.activityType === 'water' ? '💧' : '🌿'}
            </span>
            <span className="text-sm font-medium text-brand-fg">
              {log.activityType === 'water' ? t('watered') : t('fed')}
            </span>
            <span className="text-xs text-brand-fg-dim">
              {t('byActor', { name: log.performedByUserId === currentUserId ? t('you') : (log.performedByName ?? t('guest')) })}
            </span>
            <span className="ml-auto text-xs text-brand-fg-dim">
              {formatRelativeTime(log.performedAt ?? '', now, t)}
            </span>
          </div>
          {i < logs.length - 1 && <Separator className="bg-white/6" />}
        </li>
      ))}
    </ul>
  )
}
