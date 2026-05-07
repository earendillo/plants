'use client'

import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { supabase } from '@/lib/supabase/client'

export function DesktopTopBar() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const router = useRouter()
  const tPlants = useTranslations('plants')
  const tPlantNew = useTranslations('plantNew')
  const tNav = useTranslations('nav')

  const gardenParam = searchParams.get('garden')
  const isPlants = pathname === '/plants'
  const isAddPlant = pathname === '/plants/new'
  const addPlantHref = gardenParam ? `/plants/new?garden=${gardenParam}` : '/plants/new'

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <header className="flex h-[54px] shrink-0 items-center gap-3 border-b border-white/[0.07] bg-brand-bg/90 px-7 backdrop-blur-sm">
      {isPlants && (
        <h1 className="font-heading text-[22px] leading-none text-brand-fg" style={{ fontWeight: 400, letterSpacing: '-0.025em' }}>
          {tPlants('title')}
        </h1>
      )}
      {isAddPlant && (
        <h1 className="font-heading text-[22px] leading-none text-brand-fg" style={{ fontWeight: 400, letterSpacing: '-0.025em' }}>
          {tPlantNew('title')}
        </h1>
      )}

      <div className="ml-auto flex items-center gap-1.5">
        {isPlants && (
          <Link
            href={addPlantHref}
            className="flex items-center gap-1.5 rounded-[10px] bg-brand-cta px-3.5 py-1.5 text-xs font-bold text-brand-cta-fg transition-[filter] hover:brightness-90"
          >
            <span className="text-base leading-none">+</span>
            Add plant
          </Link>
        )}

        <div className="mx-1 h-5 w-px bg-white/[0.07]" />

        <Link
          href="/profile"
          className="flex size-8 items-center justify-center rounded-full border border-brand-cta/20 bg-brand-cta/[0.13] text-brand-cta transition-colors hover:bg-brand-cta/[0.22]"
          title={tNav('profile')}
        >
          <svg width="15" height="15" viewBox="0 0 14 14" fill="none">
            <circle cx="7" cy="5" r="3" stroke="currentColor" strokeWidth="1.3"/>
            <path d="M1.5 13C1.5 10.5 4 8.5 7 8.5C10 8.5 12.5 10.5 12.5 13" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
          </svg>
        </Link>

        <button
          onClick={handleSignOut}
          title={tNav('signOut')}
          className="flex size-8 items-center justify-center rounded-[9px] border border-white/[0.07] bg-transparent text-brand-fg-dim transition-colors hover:bg-white/[0.06]"
        >
          <svg width="15" height="15" viewBox="0 0 22 22" fill="none">
            <path d="M8 11H18M18 11L15 8M18 11L15 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M13 7V5C13 4 12 3 11 3H5C4 3 3 4 3 5V17C3 18 4 19 5 19H11C12 19 13 18 13 17V15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </button>
      </div>
    </header>
  )
}
