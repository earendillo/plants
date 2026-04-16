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
      <header className="border-b border-white/6 px-6 py-5">
        <h1 className="text-2xl text-brand-fg">{title}</h1>
      </header>
      {children}
      <BottomTabBar />
    </div>
  )
}
