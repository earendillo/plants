'use client'

import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { CalendarDaysIcon, RectangleStackIcon, PlusIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline'
import { supabase } from '@/lib/supabase/client'

type TabKey = 'today' | 'plants' | 'add'

const TABS: Array<{ href: string; Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>; key: TabKey }> = [
  { href: '/today', key: 'today', Icon: CalendarDaysIcon },
  { href: '/plants', key: 'plants', Icon: RectangleStackIcon },
  { href: '/plants/new', key: 'add', Icon: PlusIcon },
]

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
    <nav className="fixed bottom-0 left-0 right-0 flex bg-brand-bg border-t border-white/6">
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
              'flex flex-1 flex-col items-center pb-3 pt-2 text-xs font-medium border-t-2 -mt-px',
              isActive
                ? 'border-brand-cta text-brand-cta'
                : 'border-transparent text-brand-fg-dim',
            ].join(' ')}
          >
            <tab.Icon className="size-6" />
            <span className="mt-1">{t(tab.key)}</span>
          </Link>
        )
      })}

      <button
        onClick={handleSignOut}
        className="flex flex-1 flex-col items-center pb-3 pt-2 text-xs font-medium border-t-2 border-transparent -mt-px text-brand-fg-dim hover:text-brand-muted transition-colors"
      >
        <ArrowRightOnRectangleIcon className="size-6" />
        <span className="mt-1">{t('signOut')}</span>
      </button>
    </nav>
  )
}
