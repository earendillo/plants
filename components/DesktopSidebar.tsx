'use client'

import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { Leaf } from 'lucide-react'
import { useGardens } from '@/hooks/queries'
import { resolveActiveGarden } from '@/lib/gardens'
import { GardenPicker } from '@/components/GardenPicker'
import { RenameGardenDialog } from '@/components/RenameGardenDialog'
import { ShareDialog } from '@/components/ShareDialog'
import { DeleteGardenDialog } from '@/components/DeleteGardenDialog'
import { LeaveGardenDialog } from '@/components/LeaveGardenDialog'
import { useGardenNavigation } from '@/components/GardenNavigationContext'

function TodayIcon({ active }: { active: boolean }) {
  const c = active ? '#CFEE9E' : '#8e9489'
  return (
    <svg width="18" height="18" viewBox="0 0 22 22" fill="none">
      <rect x="3" y="4" width="16" height="15" rx="3" stroke={c} strokeWidth="1.6"/>
      <line x1="3" y1="9" x2="19" y2="9" stroke={c} strokeWidth="1.6"/>
      <line x1="7.5" y1="2" x2="7.5" y2="6" stroke={c} strokeWidth="1.6" strokeLinecap="round"/>
      <line x1="14.5" y1="2" x2="14.5" y2="6" stroke={c} strokeWidth="1.6" strokeLinecap="round"/>
    </svg>
  )
}

function PlantsIcon({ active }: { active: boolean }) {
  const c = active ? '#CFEE9E' : '#8e9489'
  return (
    <svg width="18" height="18" viewBox="0 0 22 22" fill="none">
      <rect x="3" y="3" width="7" height="7" rx="2" stroke={c} strokeWidth="1.6"/>
      <rect x="12" y="3" width="7" height="7" rx="2" stroke={c} strokeWidth="1.6"/>
      <rect x="3" y="12" width="7" height="7" rx="2" stroke={c} strokeWidth="1.6"/>
      <rect x="12" y="12" width="7" height="7" rx="2" stroke={c} strokeWidth="1.6"/>
    </svg>
  )
}

function AddIcon({ active }: { active: boolean }) {
  const c = active ? '#CFEE9E' : '#8e9489'
  return (
    <svg width="18" height="18" viewBox="0 0 22 22" fill="none">
      <circle cx="11" cy="11" r="8" stroke={c} strokeWidth="1.6"/>
      <line x1="11" y1="7" x2="11" y2="15" stroke={c} strokeWidth="1.6" strokeLinecap="round"/>
      <line x1="7" y1="11" x2="15" y2="11" stroke={c} strokeWidth="1.6" strokeLinecap="round"/>
    </svg>
  )
}

const NAV_ITEMS = [
  { href: '/today', label: 'Today', Icon: TodayIcon },
  { href: '/plants', label: 'Plants', Icon: PlantsIcon },
  { href: '/plants/new', label: 'Add Plant', Icon: AddIcon },
] as const

export function DesktopSidebar() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { isPending } = useGardenNavigation()
  const { data: gardens } = useGardens()

  const gardenParam = searchParams.get('garden') ?? undefined
  const resolvedId = gardens && gardens.length > 0
    ? resolveActiveGarden(gardens, gardenParam)
    : null
  const activeGarden = gardens?.find(g => g.id === resolvedId)
  const isOwner = activeGarden?.role === 'owner'
  const ownedGardens = gardens?.filter(g => g.role === 'owner') ?? []
  const basePath = pathname.startsWith('/plants') ? '/plants' : '/today'

  return (
    <aside className="relative flex h-screen w-[220px] shrink-0 flex-col border-r border-white/[0.07] bg-brand-surface">
      <div className="grain-overlay" />

      {/* Logo */}
      <div className="flex items-center gap-2 px-4 pb-3.5 pt-[18px]">
        <Leaf size={20} className="text-brand-cta" />
        <span className="font-heading text-[18px] text-brand-fg" style={{ fontWeight: 400, letterSpacing: '-0.025em' }}>
          LeafMo
        </span>
      </div>

      <div className="flex flex-1 flex-col overflow-hidden px-2.5">
        {/* Garden section */}
        <div className="mb-4 border-b border-white/[0.07] pb-3.5">
          <p className="mb-1.5 pl-0.5 text-[10px] font-bold uppercase tracking-[0.08em] text-brand-fg-dim">
            Garden
          </p>
          {gardens && resolvedId && (
            <>
              <GardenPicker
                gardens={gardens}
                activeGardenId={resolvedId}
                basePath={basePath}
                fullWidth
              />
              {isOwner && activeGarden && (
                <div className="mt-2 flex gap-1">
                  <RenameGardenDialog gardenId={activeGarden.id} gardenName={activeGarden.name} disabled={isPending} />
                  <ShareDialog gardenId={activeGarden.id} disabled={isPending} />
                  <DeleteGardenDialog
                    gardenId={activeGarden.id}
                    gardenName={activeGarden.name}
                    plantCount={0}
                    isLastGarden={ownedGardens.length === 1}
                    firstRemainingGardenId={gardens.find(g => g.id !== resolvedId)?.id ?? null}
                    disabled={isPending}
                  />
                </div>
              )}
              {!isOwner && activeGarden && (
                <div className="mt-2">
                  <LeaveGardenDialog
                    gardenId={activeGarden.id}
                    gardenName={activeGarden.name}
                    firstRemainingGardenId={gardens.find(g => g.id !== resolvedId)?.id ?? null}
                    disabled={isPending}
                  />
                </div>
              )}
            </>
          )}
        </div>

        {/* Nav */}
        <nav className="flex flex-col gap-0.5">
          {NAV_ITEMS.map(({ href, label, Icon }) => {
            const isActive = href === '/plants'
              ? (pathname === '/plants' || (pathname.startsWith('/plants/') && pathname !== '/plants/new'))
              : pathname === href
            const targetHref = resolvedId ? `${href}?garden=${resolvedId}` : href

            return (
              <Link
                key={href}
                href={targetHref}
                className={[
                  'flex items-center gap-2.5 rounded-[9px] border-l-2 px-2.5 py-2 text-[13px] transition-colors',
                  isActive
                    ? 'border-brand-cta bg-white/[0.07] font-semibold text-brand-fg'
                    : 'border-transparent font-normal text-brand-fg-sub hover:bg-white/[0.04]',
                ].join(' ')}
              >
                <Icon active={isActive} />
                {label}
              </Link>
            )
          })}
        </nav>
      </div>
    </aside>
  )
}
