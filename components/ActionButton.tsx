'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'

type Props = {
  plantId: string
  action: 'water' | 'feed'
}

export function ActionButton({ plantId, action }: Props) {
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

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="rounded-lg bg-brand-cta px-4 py-2 text-sm font-semibold text-brand-cta-fg transition-[filter] hover:brightness-[0.92] active:brightness-[0.84] disabled:opacity-50"
    >
      {loading ? '…' : action === 'water' ? t('water') : t('feed')}
    </button>
  )
}
