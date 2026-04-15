'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'

const TABS = [
  { href: '/today', label: 'Today', emoji: '💧' },
  { href: '/plants', label: 'Plants', emoji: '🌱' },
  { href: '/plants/new', label: 'Add', emoji: '➕' },
] as const

export function BottomTabBar() {
  const pathname = usePathname()
  const router = useRouter()

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 flex bg-white">
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
              'flex flex-1 flex-col items-center pb-3 pt-2 text-xs font-medium border-t-2',
              isActive
                ? 'border-green-600 text-green-600'
                : 'border-slate-200 text-slate-400',
            ].join(' ')}
          >
            <span className="text-xl leading-none">{tab.emoji}</span>
            <span className="mt-1">{tab.label}</span>
          </Link>
        )
      })}

      <button
        onClick={handleSignOut}
        className="flex flex-1 flex-col items-center pb-3 pt-2 text-xs font-medium border-t-2 border-slate-200 text-slate-400 hover:text-slate-600"
      >
        <span className="text-xl leading-none">🚪</span>
        <span className="mt-1">Sign out</span>
      </button>
    </nav>
  )
}
