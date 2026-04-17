// components/GardenTabs.tsx
import Link from 'next/link'
import { Garden } from '@/types'
import { CreateGardenButton } from '@/components/CreateGardenButton'

type Props = {
  gardens: Garden[]
  activeGardenId: string
  basePath: string  // e.g. "/today" or "/plants"
}

export function GardenTabs({ gardens, activeGardenId, basePath }: Props) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
      {gardens.length > 1 && gardens.map(garden => (
        <Link
          key={garden.id}
          href={`${basePath}?garden=${garden.id}`}
          className={[
            'flex-shrink-0 rounded-full px-3 py-1 text-sm font-medium transition-colors',
            garden.id === activeGardenId
              ? 'bg-brand-cta text-brand-cta-fg'
              : 'border border-white/10 text-brand-fg-dim hover:border-brand-cta/50 hover:text-brand-fg',
          ].join(' ')}
        >
          {garden.name}
        </Link>
      ))}
      <CreateGardenButton />
    </div>
  )
}
