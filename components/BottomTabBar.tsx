'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { supabase } from '@/lib/supabase/client'

type TabKey = 'today' | 'plants' | 'add'

const TABS: Array<{ href: string; emoji: string; key: TabKey }> = [
  { href: '/today', key: 'today', emoji: '💧' },
  { href: '/plants', key: 'plants', emoji: '🌱' },
  { href: '/plants/new', key: 'add', emoji: '➕' },
]

export function BottomTabBar() {
  const pathname = usePathname()
  const router = useRouter()
  const t = useTranslations('nav')

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 flex bg-brand-bg border-t border-white/6">
      {TABS.map(tab => {
        const isActive =
          tab.href === '/plants'
            ? (pathname === '/plants' || pathname.startsWith('/plants/')) && pathname !== '/plants/new'
            : pathname === tab.href

        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={[
              'flex flex-1 flex-col items-center pb-3 pt-2 text-xs font-medium border-t-2 -mt-px',
              isActive
                ? 'border-brand-cta text-brand-cta'
                : 'border-transparent text-brand-fg-dim',
            ].join(' ')}
          >
            <span className="text-xl leading-none">{tab.emoji}</span>
            <span className="mt-1">{t(tab.key)}</span>
          </Link>
        )
      })}

      <button
        onClick={handleSignOut}
        className="flex flex-1 flex-col items-center pb-3 pt-2 text-xs font-medium border-t-2 border-transparent -mt-px text-brand-fg-dim hover:text-brand-muted transition-colors"
      >
        <span className="text-xl leading-none">🚪</span>
        <span className="mt-1">{t('signOut')}</span>
      </button>
    </nav>
  )
}
