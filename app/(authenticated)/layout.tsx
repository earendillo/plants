'use client'

import { usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { BottomTabBar } from '@/components/BottomTabBar'

export default function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const tToday = useTranslations('today')
  const tPlants = useTranslations('plants')
  const tPlantNew = useTranslations('plantNew')
  const tPlantEdit = useTranslations('plantEdit')

  let title = ''
  if (pathname === '/today') title = tToday('title')
  else if (pathname === '/plants') title = tPlants('title')
  else if (pathname === '/plants/new') title = tPlantNew('title')
  else if (pathname.startsWith('/plants/')) title = tPlantEdit('title')

  return (
    <div className="flex min-h-screen flex-col bg-brand-bg">
      <header className="px-5 pb-2 pt-4">
        <h1
          className="font-heading text-[28px] leading-none text-brand-fg"
          style={{ fontWeight: 400, letterSpacing: '-0.025em' }}
        >
          {title}
        </h1>
      </header>
      {children}
      <BottomTabBar />
    </div>
  )
}
