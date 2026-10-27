'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { PlantGroup } from '@/types'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { GroupRow } from '@/components/GroupRow'

type Props = {
  open: boolean
  onClose: () => void
  gardenId: string
  groups: PlantGroup[]
  onGroupsChange: () => void
}

export function ManageGroupsDrawer({ open, onClose, gardenId, groups, onGroupsChange }: Props) {
  const t = useTranslations('plantGroups')
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [newName, setNewName] = useState('')
  const [adding, setAdding] = useState(false)
  const [addError, setAddError] = useState<string | null>(null)

  async function handleDelete(groupId: string) {
    await fetch(`/api/gardens/${gardenId}/groups/${groupId}`, { method: 'DELETE' })
    setConfirmDeleteId(null)
    onGroupsChange()
  }

  async function handleReorder(i: number, direction: 'up' | 'down') {
    const j = direction === 'up' ? i - 1 : i + 1
    if (j < 0 || j >= groups.length) return
    const a = groups[i]
    const b = groups[j]
    await Promise.all([
      fetch(`/api/gardens/${gardenId}/groups/${a.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ position: b.position }),
      }),
      fetch(`/api/gardens/${gardenId}/groups/${b.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ position: a.position }),
      }),
    ])
    onGroupsChange()
  }

  async function handleAdd() {
    const name = newName.trim()
    if (!name) return
    setAdding(true)
    setAddError(null)
    try {
      const res = await fetch(`/api/gardens/${gardenId}/groups`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, position: groups.length }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        const isDuplicate =
          res.status === 409 ||
          (typeof data?.error === 'string' && data.error.toLowerCase().includes('duplicate'))
        setAddError(isDuplicate ? t('errorDuplicate') : t('errorSaveFailed'))
        return
      }
      setNewName('')
      onGroupsChange()
    } catch {
      setAddError(t('errorSaveFailed'))
    } finally {
      setAdding(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose() }}>
      <DialogContent showCloseButton={false} className="pb-8">
        <p className="mb-4 text-center text-sm font-medium text-brand-fg">{t('manageGroups')}</p>

        <div className="mb-4 space-y-2">
          {groups.map((group, i) => (
            <GroupRow
              key={group.id}
              group={group}
              isFirst={i === 0}
              isLast={i === groups.length - 1}
              confirmingDelete={confirmDeleteId === group.id}
              onRequestDelete={() => setConfirmDeleteId(group.id)}
              onCancelDelete={() => setConfirmDeleteId(null)}
              onDelete={() => handleDelete(group.id)}
              onMoveUp={() => handleReorder(i, 'up')}
              onMoveDown={() => handleReorder(i, 'down')}
            />
          ))}
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={newName}
            onChange={e => { setNewName(e.target.value); setAddError(null) }}
            onKeyDown={e => { if (e.key === 'Enter') handleAdd() }}
            placeholder={t('groupNamePlaceholder')}
            className="flex-1 rounded-[14px] bg-brand-surface2 px-4 py-3 text-sm text-brand-fg placeholder:text-brand-fg-dim focus:outline-none"
          />
          <button
            onClick={handleAdd}
            disabled={adding || !newName.trim()}
            className="rounded-[14px] bg-brand-surface2 px-4 py-3 text-sm font-medium text-brand-fg disabled:opacity-40"
          >
            {adding ? t('saving') : t('add')}
          </button>
        </div>
        {addError && <p className="mt-2 text-xs text-red-400">{addError}</p>}
      </DialogContent>
    </Dialog>
  )
}
