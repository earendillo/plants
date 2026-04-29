'use client'

import { createContext, useContext, useTransition } from 'react'
import { useRouter } from 'next/navigation'

type ContextValue = {
  isPending: boolean
  navigateTo: (url: string) => void
}

const GardenNavigationContext = createContext<ContextValue>({
  isPending: false,
  navigateTo: () => {},
})

export function GardenNavigationProvider({ children }: { children: React.ReactNode }) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  function navigateTo(url: string) {
    startTransition(() => {
      router.push(url)
    })
  }

  return (
    <GardenNavigationContext.Provider value={{ isPending, navigateTo }}>
      {children}
    </GardenNavigationContext.Provider>
  )
}

export function useGardenNavigation() {
  return useContext(GardenNavigationContext)
}
