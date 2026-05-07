'use client'

import { usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { BottomTabBar } from '@/components/BottomTabBar'
import { TopBar } from '@/components/TopBar'
import { DesktopSidebar } from '@/components/DesktopSidebar'
import { DesktopTopBar } from '@/components/DesktopTopBar'
import { GardenNavigationProvider } from '@/components/GardenNavigationContext'
import { QueryProvider } from '@/components/QueryProvider'

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
    <QueryProvider>
      <GardenNavigationProvider>
        <div className="flex bg-brand-bg">
          {/* Desktop sidebar — visible on lg+ only */}
          <div className="hidden lg:contents">
            <DesktopSidebar />
          </div>

          {/* Main content column */}
          <div className="flex min-h-screen flex-1 flex-col min-w-0 overflow-x-hidden lg:h-screen lg:overflow-hidden">

            {/* Mobile TopBar */}
            <div className="lg:hidden">
              <TopBar />
            </div>

            {/* Desktop TopBar */}
            <div className="hidden lg:block">
              <DesktopTopBar />
            </div>

            {/* Mobile page title */}
            {!isEditPage && (
              <header className="px-5 pb-2 pt-4 lg:hidden">
                <h1
                  className="font-heading text-[28px] leading-none text-brand-fg"
                  style={{ fontWeight: 400, letterSpacing: '-0.025em' }}
                >
                  {title}
                </h1>
              </header>
            )}

            {/* Content */}
            <main className="flex flex-1 flex-col lg:overflow-y-auto">
              {children}
            </main>

            {/* Mobile BottomTabBar */}
            <div className="lg:hidden">
              <BottomTabBar />
            </div>
          </div>
        </div>
      </GardenNavigationProvider>
    </QueryProvider>
  )
}
