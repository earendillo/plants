// components/GardenHeader.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Pencil, Trash2 } from 'lucide-react'
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
  plantCount: number
  isLastGarden: boolean
  firstRemainingGardenId: string | null
}

export function GardenHeader({
  garden,
  plantCount,
  isLastGarden,
  firstRemainingGardenId,
}: Props) {
  const router = useRouter()

  // rename state
  const [renameOpen, setRenameOpen] = useState(false)
  const [name, setName] = useState(garden.name)
  const [renameLoading, setRenameLoading] = useState(false)
  const [renameError, setRenameError] = useState<string | null>(null)

  // delete state
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  function handleRenameOpenChange(next: boolean) {
    setRenameOpen(next)
    if (next) {
      setName(garden.name)
      setRenameError(null)
      setRenameLoading(false)
    }
  }

  function handleDeleteOpenChange(next: boolean) {
    setDeleteOpen(next)
    if (next) {
      setDeleteError(null)
      setDeleteLoading(false)
    }
  }

  async function handleRenameSubmit(e: React.FormEvent) {
    e.preventDefault()
    setRenameLoading(true)
    setRenameError(null)
    try {
      const res = await fetch(`/api/gardens/${garden.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      })
      if (res.status === 409) {
        setRenameError('A garden with that name already exists')
        setRenameLoading(false)
        return
      }
      if (!res.ok) throw new Error(`Server error: ${res.status}`)
      setRenameLoading(false)
      setRenameOpen(false)
      router.refresh()
    } catch {
      setRenameError('Failed to rename garden')
      setRenameLoading(false)
    }
  }

  async function handleDelete() {
    setDeleteLoading(true)
    setDeleteError(null)
    try {
      const res = await fetch(`/api/gardens/${garden.id}`, { method: 'DELETE' })
      if (!res.ok) {
        const body = (await res.json()) as { error: string }
        setDeleteError(body.error ?? 'Failed to delete garden')
        setDeleteLoading(false)
        return
      }
      setDeleteOpen(false)
      if (firstRemainingGardenId) {
        router.push(`/plants?garden=${firstRemainingGardenId}`)
      }
      router.refresh()
    } catch {
      setDeleteError('Failed to delete garden')
      setDeleteLoading(false)
    }
  }

  const deleteDisabled = plantCount > 0 || isLastGarden
  const deleteTitle =
    plantCount > 0
      ? 'Remove all plants before deleting'
      : isLastGarden
        ? 'Cannot delete the last garden'
        : 'Delete garden'

  return (
    <div className="flex items-center gap-2">
      <h2 className="text-lg font-semibold text-brand-fg">{garden.name}</h2>

      {/* Rename dialog */}
      <Dialog open={renameOpen} onOpenChange={handleRenameOpenChange}>
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
          <form onSubmit={handleRenameSubmit} className="space-y-4 pt-2">
            {renameError && (
              <p className="text-sm text-brand-alert">{renameError}</p>
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
              disabled={
                renameLoading ||
                name.trim().length === 0 ||
                name.trim() === garden.name
              }
              className="w-full bg-brand-cta text-brand-cta-fg hover:brightness-[0.92]"
            >
              {renameLoading ? 'Saving…' : 'Save'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete button */}
      <button
        aria-label={deleteTitle}
        title={deleteTitle}
        disabled={deleteDisabled}
        onClick={() => setDeleteOpen(true)}
        className="rounded p-1 text-brand-fg-dim hover:text-brand-alert transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:text-brand-fg-dim"
      >
        <Trash2 size={16} />
      </button>

      {/* Delete confirmation dialog */}
      <Dialog open={deleteOpen} onOpenChange={handleDeleteOpenChange}>
        <DialogContent className="bg-brand-surface border-white/10 text-brand-fg">
          <DialogHeader>
            <DialogTitle>Delete garden</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <p className="text-sm text-brand-fg-dim">
              Are you sure you want to delete{' '}
              <strong className="text-brand-fg">{garden.name}</strong>? This
              cannot be undone.
            </p>
            {deleteError && (
              <p className="text-sm text-brand-alert">{deleteError}</p>
            )}
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setDeleteOpen(false)}
                className="flex-1 border-white/10 bg-transparent text-brand-fg hover:bg-white/5"
              >
                Cancel
              </Button>
              <Button
                onClick={handleDelete}
                disabled={deleteLoading}
                className="flex-1 bg-brand-alert text-white hover:brightness-[0.92]"
              >
                {deleteLoading ? 'Deleting…' : 'Delete'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
