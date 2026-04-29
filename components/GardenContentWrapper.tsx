'use client'

import { useGardenNavigation } from './GardenNavigationContext'

type Props = {
  children: React.ReactNode
  skeleton: React.ReactNode
}

export function GardenContentWrapper({ children, skeleton }: Props) {
  const { isPending } = useGardenNavigation()
  return isPending ? <>{skeleton}</> : <>{children}</>
}
