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

  const isWater = action === 'water'

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={[
        'rounded-lg px-4 py-2 text-sm font-semibold text-white',
        'disabled:opacity-50 transition-opacity',
        isWater
          ? 'bg-green-600 hover:bg-green-700 active:bg-green-800'
          : 'bg-yellow-700 hover:bg-yellow-800 active:bg-yellow-900',
      ].join(' ')}
    >
      {loading ? '…' : isWater ? t('water') : t('feed')}
    </button>
  )
}
