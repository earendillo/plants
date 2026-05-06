import { PlantsPageContent } from '@/components/PlantsPageContent'

export default async function PlantsPage({
  searchParams,
}: {
  searchParams: Promise<{ garden?: string }>
}) {
  const { garden: gardenParam } = await searchParams

  return <PlantsPageContent gardenParam={gardenParam} />
}
