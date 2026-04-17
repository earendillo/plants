// components/GardenHeader.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Pencil } from 'lucide-react'
import { Garden } from '@/types'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

type Props = {
  garden: Garden
}

export function GardenHeader({ garden }: Props) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState(garden.name)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handleOpenChange(next: boolean) {
    setOpen(next)
    if (next) {
      setName(garden.name)
      setError(null)
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/gardens/${garden.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      })
      if (res.status === 409) {
        setError('A garden with that name already exists')
        setLoading(false)
        return
      }
      if (!res.ok) throw new Error(`Server error: ${res.status}`)
      setLoading(false)
      setOpen(false)
      router.refresh()
    } catch {
      setError('Failed to rename garden')
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <h2 className="text-lg font-semibold text-brand-fg">{garden.name}</h2>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogTrigger
          aria-label="Rename garden"
          className="rounded p-1 text-brand-fg-dim hover:text-brand-fg transition-colors"
        >
          <Pencil size={16} />
        </DialogTrigger>
        <DialogContent className="bg-brand-surface border-white/10 text-brand-fg">
          <DialogHeader>
            <DialogTitle>Rename Garden</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            {error && (
              <p className="text-sm text-brand-alert">{error}</p>
            )}
            <Input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Garden name"
              className="border-white/10 bg-brand-bg text-brand-fg placeholder:text-brand-fg-dim"
              autoFocus
            />
            <Button
              type="submit"
              disabled={loading || name.trim().length === 0 || name.trim() === garden.name}
              className="w-full bg-brand-cta text-brand-cta-fg hover:brightness-[0.92]"
            >
              {loading ? 'Saving…' : 'Save'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
