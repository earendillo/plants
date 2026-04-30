// app/(authenticated)/plants/new/page.tsx
import { redirect } from 'next/navigation'
import { getGardens, ensureDefaultGarden } from '@/lib/db/gardens'
import { resolveActiveGarden } from '@/lib/gardens'
import { getAuthenticatedUser } from '@/lib/auth'
import { PlantForm } from '@/components/PlantForm'

export default async function NewPlantPage({
  searchParams,
}: {
  searchParams: Promise<{ garden?: string }>
}) {
  const { garden: gardenParam } = await searchParams
  const user = await getAuthenticatedUser()
  const gardens = await getGardens(user?.id ?? '')

  if (gardens.length === 0) {
    await ensureDefaultGarden(user!.id)
    redirect('/plants/new')
  }

  const resolvedId = resolveActiveGarden(gardens, gardenParam)
  if (gardenParam !== resolvedId) {
    redirect(`/plants/new?garden=${resolvedId}`)
  }

  const activeGarden = gardens.find(g => g.id === resolvedId)!
  if (activeGarden.role !== 'owner') {
    redirect(`/plants?garden=${resolvedId}`)
  }

  return (
    <main className="flex-1 px-4 py-6 pb-28">
      <PlantForm gardenId={resolvedId} />
    </main>
  )
}
