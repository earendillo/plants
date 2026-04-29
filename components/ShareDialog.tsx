// components/ShareDialog.tsx
'use client'

import { useState } from 'react'
import { Share2, Copy, RefreshCw } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

type Props = { gardenId: string; disabled?: boolean }

export function ShareDialog({ gardenId, disabled }: Props) {
  const [open, setOpen] = useState(false)

  // member share link state
  const [shareUrl, setShareUrl] = useState<string | null>(null)
  const [shareLoading, setShareLoading] = useState(false)
  const [shareCopied, setShareCopied] = useState(false)

  // anonymous share link state
  const [anonUrl, setAnonUrl] = useState<string | null>(null)
  const [anonLoading, setAnonLoading] = useState(false)
  const [anonCopied, setAnonCopied] = useState(false)
  const [durationDays, setDurationDays] = useState(7)

  async function handleOpenChange(next: boolean) {
    setOpen(next)
    if (next) {
      setShareLoading(true)
      setShareCopied(false)
      setAnonLoading(true)
      setAnonCopied(false)
      try {
        const [shareRes, anonRes] = await Promise.all([
          fetch(`/api/gardens/${gardenId}/share-link`),
          fetch(`/api/gardens/${gardenId}/anonymous-share-link`),
        ])
        if (shareRes.ok) {
          const data = (await shareRes.json()) as { url: string | null }
          setShareUrl(data.url)
        }
        if (anonRes.ok) {
          const data = (await anonRes.json()) as { url: string | null }
          setAnonUrl(data.url)
        }
      } finally {
        setShareLoading(false)
        setAnonLoading(false)
      }
    }
  }

  async function handleCreateOrRotateLink() {
    setShareLoading(true)
    setShareCopied(false)
    try {
      const res = await fetch(`/api/gardens/${gardenId}/share-link`, { method: 'POST' })
      if (res.ok) {
        const data = (await res.json()) as { url: string }
        setShareUrl(data.url)
      }
    } finally {
      setShareLoading(false)
    }
  }

  async function handleRevokeLink() {
    setShareLoading(true)
    try {
      await fetch(`/api/gardens/${gardenId}/share-link`, { method: 'DELETE' })
      setShareUrl(null)
    } finally {
      setShareLoading(false)
    }
  }

  function handleCopy() {
    if (shareUrl) {
      navigator.clipboard.writeText(shareUrl)
      setShareCopied(true)
      setTimeout(() => setShareCopied(false), 2000)
    }
  }

  async function handleCreateAnon() {
    setAnonLoading(true)
    setAnonCopied(false)
    try {
      const res = await fetch(`/api/gardens/${gardenId}/anonymous-share-link`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ durationDays }),
      })
      if (res.ok) {
        const data = (await res.json()) as { url: string }
        setAnonUrl(data.url)
      }
    } finally {
      setAnonLoading(false)
    }
  }

  async function handleRevokeAnon() {
    setAnonLoading(true)
    try {
      await fetch(`/api/gardens/${gardenId}/anonymous-share-link`, { method: 'DELETE' })
      setAnonUrl(null)
    } finally {
      setAnonLoading(false)
    }
  }

  function handleAnonCopy() {
    if (anonUrl) {
      navigator.clipboard.writeText(anonUrl)
      setAnonCopied(true)
      setTimeout(() => setAnonCopied(false), 2000)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        aria-label="Share garden"
        disabled={disabled}
        className="flex size-11 items-center justify-center rounded-xl border border-white/[0.09] bg-white/[0.04] text-brand-fg-sub transition-colors hover:bg-white/[0.09] hover:text-brand-fg disabled:opacity-30 disabled:cursor-not-allowed"
      >
        <Share2 size={16} />
      </DialogTrigger>
      <DialogContent className="bg-brand-surface border-white/10 text-brand-fg">
        <DialogHeader>
          <DialogTitle>Share garden</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          {/* Member share link section */}
          <p className="text-sm text-brand-fg-dim">
            Share this link with someone. They can view plants and mark
            watering/feeding — but cannot edit or delete.
          </p>

          {shareLoading && (
            <p className="text-sm text-brand-fg-dim">Loading…</p>
          )}

          {!shareLoading && shareUrl && (
            <>
              <div className="flex gap-2">
                <Input
                  readOnly
                  value={shareUrl}
                  className="border-white/10 bg-brand-bg text-brand-fg text-xs"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCopy}
                  className="shrink-0 border-white/10 bg-transparent text-brand-fg hover:bg-white/5"
                >
                  {shareCopied ? 'Copied!' : <Copy size={16} />}
                </Button>
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCreateOrRotateLink}
                  disabled={shareLoading}
                  className="flex-1 border-white/10 bg-transparent text-brand-fg hover:bg-white/5 text-sm"
                >
                  <RefreshCw size={14} className="mr-1" />
                  Rotate link
                </Button>
                <Button
                  type="button"
                  onClick={handleRevokeLink}
                  disabled={shareLoading}
                  className="flex-1 bg-brand-alert text-white hover:brightness-[0.92] text-sm"
                >
                  Revoke
                </Button>
              </div>
            </>
          )}

          {!shareLoading && !shareUrl && (
            <Button
              type="button"
              onClick={handleCreateOrRotateLink}
              disabled={shareLoading}
              className="w-full bg-brand-cta text-brand-cta-fg hover:brightness-[0.92]"
            >
              Create share link
            </Button>
          )}

          {/* Anonymous guest access section */}
          <div className="border-t border-white/10 pt-4 space-y-3">
            <div>
              <p className="text-sm font-medium text-brand-fg">Guest access</p>
              <p className="text-sm text-brand-fg-dim">
                Anyone with this link can water and feed plants without logging in.
              </p>
            </div>

            {anonLoading && (
              <p className="text-sm text-brand-fg-dim">Loading…</p>
            )}

            {!anonLoading && anonUrl && (
              <>
                <div className="flex gap-2">
                  <Input
                    readOnly
                    value={anonUrl}
                    className="border-white/10 bg-brand-bg text-brand-fg text-xs"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleAnonCopy}
                    className="shrink-0 border-white/10 bg-transparent text-brand-fg hover:bg-white/5"
                  >
                    {anonCopied ? 'Copied!' : <Copy size={16} />}
                  </Button>
                </div>
                <Button
                  type="button"
                  onClick={handleRevokeAnon}
                  disabled={anonLoading}
                  className="w-full bg-brand-alert text-white hover:brightness-[0.92] text-sm"
                >
                  Revoke guest link
                </Button>
              </>
            )}

            {!anonLoading && !anonUrl && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-brand-fg-dim">Expires in</span>
                  <select
                    value={durationDays}
                    onChange={e => setDurationDays(Number(e.target.value))}
                    className="text-sm bg-brand-bg border border-white/10 rounded px-2 py-1 text-brand-fg"
                  >
                    {[1,2,3,4,5,6,7,8,9,10,11,12,13,14].map(d => (
                      <option key={d} value={d}>{d} {d === 1 ? 'day' : 'days'}</option>
                    ))}
                  </select>
                </div>
                <Button
                  type="button"
                  onClick={handleCreateAnon}
                  disabled={anonLoading}
                  className="w-full bg-brand-cta text-brand-cta-fg hover:brightness-[0.92]"
                >
                  Create guest link
                </Button>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
