'use client'

import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { supabase } from '@/lib/supabase/client'

type TabKey = 'today' | 'plants' | 'add'

function TodayIcon({ active }: { active: boolean }) {
  const c = active ? '#CFEE9E' : '#8e9489'
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <rect x="3" y="4" width="16" height="15" rx="3" stroke={c} strokeWidth="1.5"/>
      <line x1="3" y1="9" x2="19" y2="9" stroke={c} strokeWidth="1.5"/>
      <line x1="7.5" y1="2" x2="7.5" y2="6" stroke={c} strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="14.5" y1="2" x2="14.5" y2="6" stroke={c} strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  )
}

function PlantsIcon({ active }: { active: boolean }) {
  const c = active ? '#CFEE9E' : '#8e9489'
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <rect x="3" y="3" width="7" height="7" rx="2" stroke={c} strokeWidth="1.5"/>
      <rect x="12" y="3" width="7" height="7" rx="2" stroke={c} strokeWidth="1.5"/>
      <rect x="3" y="12" width="7" height="7" rx="2" stroke={c} strokeWidth="1.5"/>
      <rect x="12" y="12" width="7" height="7" rx="2" stroke={c} strokeWidth="1.5"/>
    </svg>
  )
}

function AddIcon({ active }: { active: boolean }) {
  const c = active ? '#CFEE9E' : '#8e9489'
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <circle cx="11" cy="11" r="8" stroke={c} strokeWidth="1.5"/>
      <line x1="11" y1="7" x2="11" y2="15" stroke={c} strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="7" y1="11" x2="15" y2="11" stroke={c} strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  )
}

function SignOutIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <path d="M8 11H18M18 11L15 8M18 11L15 14" stroke="#8e9489" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M13 7V5C13 4 12 3 11 3H5C4 3 3 4 3 5V17C3 18 4 19 5 19H11C12 19 13 18 13 17V15" stroke="#8e9489" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  )
}

const TABS: Array<{ href: string; key: TabKey }> = [
  { href: '/today', key: 'today' },
  { href: '/plants', key: 'plants' },
  { href: '/plants/new', key: 'add' },
]

const TAB_ICONS: Record<TabKey, (active: boolean) => React.ReactNode> = {
  today:  active => <TodayIcon active={active} />,
  plants: active => <PlantsIcon active={active} />,
  add:    active => <AddIcon active={active} />,
}

export function BottomTabBar() {
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()
  const t = useTranslations('nav')
  const gardenParam = searchParams.get('garden')
  const tabHref = (base: string) => gardenParam ? `${base}?garden=${gardenParam}` : base

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 flex bg-brand-bg border-t border-white/[0.07] pb-2">
      {TABS.map(tab => {
        const isActive =
          tab.href === '/plants'
            ? (pathname === '/plants' || pathname.startsWith('/plants/')) && pathname !== '/plants/new'
            : pathname === tab.href

        return (
          <Link
            key={tab.href}
            href={tabHref(tab.href)}
            className={[
              'flex flex-1 flex-col items-center gap-1 pt-2.5 pb-1 text-[10px] font-medium tracking-[0.02em] border-t-2 -mt-px',
              isActive ? 'border-brand-cta text-brand-cta' : 'border-transparent text-brand-fg-dim',
            ].join(' ')}
          >
            {TAB_ICONS[tab.key](isActive)}
            <span>{t(tab.key)}</span>
          </Link>
        )
      })}

      <button
        onClick={handleSignOut}
        className="flex flex-1 flex-col items-center gap-1 pt-2.5 pb-1 text-[10px] font-medium tracking-[0.02em] border-t-2 border-transparent -mt-px text-brand-fg-dim transition-colors hover:text-brand-fg-sub"
      >
        <SignOutIcon />
        <span>{t('signOut')}</span>
      </button>
    </nav>
  )
}
