// components/CreateGardenButton.tsx
'use client'

import { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export function CreateGardenButton() {
  const router = useRouter()
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/gardens', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      })
      if (res.status === 409) {
        setError('A garden with that name already exists')
        setLoading(false)
        return
      }
      if (!res.ok) throw new Error(`Server error: ${res.status}`)
      const garden = await res.json() as { id: string }
      setOpen(false)
      setName('')
      router.push(`${pathname}?garden=${garden.id}`)
    } catch {
      setError('Failed to create garden')
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="flex-shrink-0 rounded-full border border-white/10 px-3 py-1 text-sm text-brand-fg-dim hover:border-brand-cta/50 hover:text-brand-fg transition-colors">
          + Garden
        </button>
      </DialogTrigger>
      <DialogContent className="bg-brand-surface border-white/10 text-brand-fg">
        <DialogHeader>
          <DialogTitle>New Garden</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {error && (
            <p className="text-sm text-brand-alert">{error}</p>
          )}
          <Input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="e.g. Balcony, Office"
            className="border-white/10 bg-brand-bg text-brand-fg placeholder:text-brand-fg-dim"
            autoFocus
          />
          <Button
            type="submit"
            disabled={loading || name.trim().length === 0}
            className="w-full bg-brand-cta text-brand-cta-fg hover:brightness-[0.92]"
          >
            {loading ? 'Creating…' : 'Create Garden'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
