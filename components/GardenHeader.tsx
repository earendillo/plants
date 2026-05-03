// components/GardenHeader.tsx
'use client'

import { Garden } from '@/types'
import { useGardenNavigation } from './GardenNavigationContext'
import { RenameGardenDialog } from '@/components/RenameGardenDialog'
import { DeleteGardenDialog } from '@/components/DeleteGardenDialog'
import { LeaveGardenDialog } from '@/components/LeaveGardenDialog'
import { ShareDialog } from '@/components/ShareDialog'

type Props = {
  garden: Garden
  plantCount: number
  isLastGarden: boolean
  firstRemainingGardenId: string | null
}

export function GardenHeader({
  garden,
  plantCount,
  isLastGarden,
  firstRemainingGardenId,
}: Props) {
  const { isPending } = useGardenNavigation()
  const isOwner = garden.role === 'owner'

  return (
    <div className="flex items-center gap-1.5">
      {isOwner && (
        <>
          <RenameGardenDialog
            gardenId={garden.id}
            gardenName={garden.name}
            disabled={isPending}
          />
          <DeleteGardenDialog
            gardenId={garden.id}
            gardenName={garden.name}
            plantCount={plantCount}
            isLastGarden={isLastGarden}
            firstRemainingGardenId={firstRemainingGardenId}
            disabled={isPending}
          />
          <ShareDialog gardenId={garden.id} disabled={isPending} />
        </>
      )}

      {!isOwner && (
        <LeaveGardenDialog
          gardenId={garden.id}
          gardenName={garden.name}
          firstRemainingGardenId={firstRemainingGardenId}
          disabled={isPending}
        />
      )}
    </div>
  )
}
