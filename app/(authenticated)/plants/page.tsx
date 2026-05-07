import { PlantsPageContent } from '@/components/PlantsPageContent'

export default async function PlantsPage({
  searchParams,
}: {
  searchParams: Promise<{ garden?: string; plant?: string }>
}) {
  const { garden: gardenParam, plant: plantParam } = await searchParams

  return <PlantsPageContent gardenParam={gardenParam} plantParam={plantParam} />
}
