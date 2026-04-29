'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'

type Props = {
  plantId: string
  action: 'water' | 'feed'
  isOverdue?: boolean
}

export function ActionButton({ plantId, action, isOverdue }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const t = useTranslations('actionButton')

  async function handleClick() {
    setLoading(true)
    try {
      const res = await fetch(`/api/plants/${plantId}/${action}`, { method: 'POST' })
      if (!res.ok) throw new Error(`Server error: ${res.status}`)
      router.refresh()
      // setLoading(false) intentionally omitted on success — RSC refresh unmounts this component
    } catch (err) {
      console.error('Action failed', err)
      setLoading(false)
    }
  }

  const cls = isOverdue
    ? 'rounded-[13px] bg-brand-alert px-5 py-2.5 text-sm font-semibold text-white shadow-[0_2px_12px_rgba(224,85,85,0.3)] transition-[filter] hover:brightness-[0.9] active:brightness-[0.82] disabled:opacity-50'
    : 'rounded-[13px] bg-brand-cta px-5 py-2.5 text-sm font-semibold text-brand-cta-fg shadow-[0_2px_12px_rgba(207,238,158,0.2)] transition-[filter] hover:brightness-[0.92] active:brightness-[0.84] disabled:opacity-50'

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={cls}
    >
      {loading ? '…' : action === 'water' ? t('water') : t('feed')}
    </button>
  )
}
