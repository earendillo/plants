'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Garden } from '@/types'
import { useGardenNavigation } from './GardenNavigationContext'

type Props = {
  gardens: Garden[]
  activeGardenId: string
  basePath: string
}

export function GardenPicker({ gardens, activeGardenId, basePath }: Props) {
  const [open, setOpen] = useState(false)
  const [createOpen, setCreateOpen] = useState(false)
  const [newName, setNewName] = useState('')
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)
  const ref = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const pathname = usePathname()
  const { navigateTo } = useGardenNavigation()

  const activeGarden = gardens.find(g => g.id === activeGardenId)

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setCreating(true)
    setCreateError(null)
    try {
      const res = await fetch('/api/gardens', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName }),
      })
      if (res.status === 409) {
        setCreateError('A garden with that name already exists')
        setCreating(false)
        return
      }
      if (!res.ok) throw new Error(`Server error: ${res.status}`)
      const garden = (await res.json()) as { id: string }
      setCreateOpen(false)
      setNewName('')
      router.push(`${pathname}?garden=${garden.id}`)
      router.refresh()
    } catch {
      setCreateError('Failed to create garden')
      setCreating(false)
    }
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex h-11 items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.06] px-3.5 text-xs font-medium tracking-[0.01em] text-brand-fg-sub transition-colors hover:bg-white/[0.09]"
      >
        <span className="size-1.5 flex-shrink-0 rounded-full bg-brand-cta" />
        <span>{activeGarden?.name ?? '—'}</span>
        <svg
          width="10" height="10" viewBox="0 0 10 10" fill="none"
          className={`opacity-45 transition-transform duration-150 ${open ? 'rotate-180' : ''}`}
        >
          <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {open && (
        <div className="absolute left-0 top-[calc(100%+6px)] z-50 min-w-36 rounded-2xl border border-white/7 bg-brand-surface2 p-1 shadow-[0_12px_40px_rgba(0,0,0,0.5)]">
          {gardens.map(g => (
            <button
              key={g.id}
              onClick={() => {
                navigateTo(`${basePath}?garden=${g.id}`)
                setOpen(false)
              }}
              className={[
                'block w-full rounded-xl px-3 py-2 text-left text-sm transition-colors',
                g.id === activeGardenId
                  ? 'bg-white/7 font-medium text-brand-fg'
                  : 'text-brand-fg-sub hover:bg-white/5',
              ].join(' ')}
            >
              {g.name}
            </button>
          ))}

          <div className="mx-1 my-1 border-t border-white/[0.06]" />

          {!createOpen ? (
            <button
              onClick={() => { setCreateOpen(true); setCreateError(null) }}
              className="block w-full rounded-xl px-3 py-2 text-left text-sm text-brand-fg-dim hover:bg-white/5 hover:text-brand-fg-sub transition-colors"
            >
              + New garden
            </button>
          ) : (
            <form onSubmit={handleCreate} className="flex flex-col gap-2 p-2">
              {createError && (
                <p className="text-xs text-brand-alert">{createError}</p>
              )}
              <input
                value={newName}
                onChange={e => setNewName(e.target.value)}
                placeholder="Garden name"
                autoFocus
                className="rounded-lg border border-white/10 bg-brand-surface px-3 py-2 text-sm text-brand-fg placeholder:text-brand-fg-dim focus:border-brand-cta focus:outline-none"
              />
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() => { setCreateOpen(false); setNewName('') }}
                  className="flex-1 rounded-lg border border-white/10 py-1.5 text-xs text-brand-fg-sub hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating || newName.trim().length === 0}
                  className="flex-1 rounded-lg bg-brand-cta py-1.5 text-xs font-bold text-brand-cta-fg disabled:opacity-50 hover:brightness-90 transition-[filter]"
                >
                  {creating ? '…' : 'Create'}
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  )
}
