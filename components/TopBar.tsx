'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Leaf, Menu, User, LogOut } from 'lucide-react'

import { supabase } from '@/lib/supabase/client'
import { Sheet, SheetContent, SheetClose, SheetTrigger } from '@/components/ui/sheet'
import { LanguageSelector } from '@/components/LanguageSelector'

export function TopBar() {
  const router = useRouter()
  const t = useTranslations('nav')

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between border-b border-white/[0.07] bg-brand-bg/90 px-4 py-3 backdrop-blur-sm">
      <Link
        href="/today"
        className="flex items-center gap-2 text-brand-fg font-heading text-lg tracking-tight"
        style={{ letterSpacing: '-0.02em' }}
      >
        <Leaf size={20} className="text-brand-cta" />
        PlantTracker
      </Link>

      <Sheet>
        <SheetTrigger className="flex items-center justify-center rounded-md p-2 text-brand-fg-dim hover:text-brand-fg transition-colors">
          <Menu size={22} />
          <span className="sr-only">Open menu</span>
        </SheetTrigger>

        <SheetContent>
          <div className="mt-8 flex flex-col gap-1">
            <SheetClose
              nativeButton={false}
              render={
                <Link
                  href="/profile"
                  className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-brand-fg hover:bg-white/[0.05] transition-colors"
                />
              }
            >
              <User size={18} className="text-brand-fg-dim" />
              {t('profile')}
            </SheetClose>
          </div>

          <div className="mt-auto flex flex-col gap-4 pt-6 border-t border-white/[0.07]">
            <LanguageSelector />
            <button
              onClick={handleSignOut}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-brand-fg-dim hover:text-brand-fg hover:bg-white/[0.05] transition-colors"
            >
              <LogOut size={18} />
              {t('signOut')}
            </button>
          </div>
        </SheetContent>
      </Sheet>
    </header>
  )
}
