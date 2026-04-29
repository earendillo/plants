// components/GuestTokenValidator.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

type Props = { token: string }

export function GuestTokenValidator({ token }: Props) {
  const router = useRouter()
  const [invalid, setInvalid] = useState(false)

  useEffect(() => {
    fetch('/api/guest/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    })
      .then(res => {
        if (res.ok) {
          router.replace('/guest')
        } else {
          setInvalid(true)
        }
      })
      .catch(() => setInvalid(true))
  }, [token, router])

  if (invalid) {
    return (
      <main className="min-h-screen bg-brand-bg p-6 text-brand-fg flex items-center justify-center">
        <p className="text-brand-fg-dim text-center">
          This link is invalid or has expired.
        </p>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-brand-bg p-6 text-brand-fg flex items-center justify-center">
      <p className="text-brand-fg-dim text-center">Verifying link…</p>
    </main>
  )
}
