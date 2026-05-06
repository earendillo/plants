import { useQuery } from '@tanstack/react-query'
import { Garden, Plant } from '@/types'

async function fetchGardens(): Promise<Garden[]> {
  const res = await fetch('/api/gardens')
  if (!res.ok) throw new Error(`Failed to fetch gardens: ${res.status}`)
  return res.json()
}

async function fetchPlants(gardenId: string): Promise<Plant[]> {
  const res = await fetch(`/api/plants?gardenId=${gardenId}`)
  if (!res.ok) throw new Error(`Failed to fetch plants: ${res.status}`)
  return res.json()
}

export function useGardens() {
  return useQuery({
    queryKey: ['gardens'],
    queryFn: fetchGardens,
  })
}

export function usePlants(gardenId: string | null) {
  return useQuery({
    queryKey: ['plants', gardenId],
    queryFn: () => fetchPlants(gardenId!),
    enabled: !!gardenId,
  })
}
