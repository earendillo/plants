'use client'

import { useTranslations } from 'next-intl'
import { Garden } from '@/types'
import { GardenPicker } from '@/components/GardenPicker'
import { RenameGardenDialog } from '@/components/RenameGardenDialog'
import { ShareDialog } from '@/components/ShareDialog'
import { DeleteGardenDialog } from '@/components/DeleteGardenDialog'
import { LeaveGardenDialog } from '@/components/LeaveGardenDialog'

type Props = {
  gardens: Garden[] | undefined
  resolvedId: string | null
  basePath: string
  isPending: boolean
}

export function SidebarGardenSection({ gardens, resolvedId, basePath, isPending }: Props) {
  const t = useTranslations('nav')
  const activeGarden = gardens?.find(g => g.id === resolvedId)
  const isOwner = activeGarden?.role === 'owner'
  const ownedGardens = gardens?.filter(g => g.role === 'owner') ?? []

  return (
    <div className="mb-4 border-b border-white/[0.07] pb-3.5">
      <p className="mb-1.5 pl-0.5 text-[10px] font-bold uppercase tracking-[0.08em] text-brand-fg-dim">
        {t('garden')}
      </p>
      {gardens && resolvedId && (
        <>
          <GardenPicker
            gardens={gardens}
            activeGardenId={resolvedId}
            basePath={basePath}
            fullWidth
          />
          {isOwner && activeGarden && (
            <div className="mt-2 flex gap-1">
              <RenameGardenDialog gardenId={activeGarden.id} gardenName={activeGarden.name} disabled={isPending} />
              <ShareDialog gardenId={activeGarden.id} disabled={isPending} />
              <DeleteGardenDialog
                gardenId={activeGarden.id}
                gardenName={activeGarden.name}
                plantCount={0}
                isLastGarden={ownedGardens.length === 1}
                firstRemainingGardenId={gardens.find(g => g.id !== resolvedId)?.id ?? null}
                disabled={isPending}
              />
            </div>
          )}
          {!isOwner && activeGarden && (
            <div className="mt-2">
              <LeaveGardenDialog
                gardenId={activeGarden.id}
                gardenName={activeGarden.name}
                firstRemainingGardenId={gardens.find(g => g.id !== resolvedId)?.id ?? null}
                disabled={isPending}
              />
            </div>
          )}
        </>
      )}
    </div>
  )
}
