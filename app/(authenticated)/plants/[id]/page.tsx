// app/(authenticated)/plants/[id]/page.tsx
import { notFound, redirect } from 'next/navigation'
import { getPlant } from '@/lib/db/plants'
import { getGardens } from '@/lib/db/gardens'
import { getAuthenticatedUser } from '@/lib/auth'
import { PlantForm } from '@/components/PlantForm'
import { ActivityTimeline } from '@/components/ActivityTimeline'

export default async function EditPlantPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const user = await getAuthenticatedUser()
  if (!user) redirect('/login')

  const [plant, gardens] = await Promise.all([
    getPlant(id, user.id),
    getGardens(user.id),
  ])

  if (!plant) notFound()

  const gardenForPlant = gardens.find(g => g.id === plant.gardenId)
  if (!gardenForPlant || gardenForPlant.role !== 'owner') {
    redirect(`/plants?garden=${plant.gardenId}`)
  }

  return (
    <main className="flex-1">
      <PlantForm
        plant={plant}
        gardens={gardens}
        activityContent={<ActivityTimeline plantId={plant.id} currentUserId={user.id} />}
      />
    </main>
  )
}
