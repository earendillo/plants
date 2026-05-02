'use client'

import { usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { BottomTabBar } from '@/components/BottomTabBar'
import { TopBar } from '@/components/TopBar'
import { GardenNavigationProvider } from '@/components/GardenNavigationContext'

export default function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const tToday = useTranslations('today')
  const tPlants = useTranslations('plants')
  const tPlantNew = useTranslations('plantNew')
  const isEditPage = pathname !== '/plants/new' && pathname.startsWith('/plants/')

  let title = ''
  if (pathname === '/today') title = tToday('title')
  else if (pathname === '/plants') title = tPlants('title')
  else if (pathname === '/plants/new') title = tPlantNew('title')

  return (
    <GardenNavigationProvider>
      <div className="flex min-h-screen flex-col bg-brand-bg">
        <TopBar />
        {!isEditPage && (
          <header className="px-5 pb-2 pt-4">
            <h1
              className="font-heading text-[28px] leading-none text-brand-fg"
              style={{ fontWeight: 400, letterSpacing: '-0.025em' }}
            >
              {title}
            </h1>
          </header>
        )}
        <main className="flex flex-1 flex-col">
          {children}
        </main>
        <BottomTabBar />
      </div>
    </GardenNavigationProvider>
  )
}
