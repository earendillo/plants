'use client'

import { type ReactNode } from 'react'
import { useTranslations } from 'next-intl'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'

export function PlantDetailTabs({
  detailsContent,
  activityContent,
}: {
  detailsContent: ReactNode
  activityContent: ReactNode
}) {
  const t = useTranslations('plantEdit')

  return (
    <Tabs defaultValue="details">
      <TabsList className="w-full rounded-xl bg-white/6 p-1">
        <TabsTrigger
          value="details"
          className="flex-1 rounded-lg text-brand-fg-dim data-active:bg-white/8 data-active:text-brand-fg"
        >
          {t('tabDetails')}
        </TabsTrigger>
        <TabsTrigger
          value="activity"
          className="flex-1 rounded-lg text-brand-fg-dim data-active:bg-white/8 data-active:text-brand-fg"
        >
          {t('tabActivity')}
        </TabsTrigger>
      </TabsList>
      <TabsContent value="details" className="mt-4">
        {detailsContent}
      </TabsContent>
      <TabsContent value="activity" className="mt-4">
        {activityContent}
      </TabsContent>
    </Tabs>
  )
}
