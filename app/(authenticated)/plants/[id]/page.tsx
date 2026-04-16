import { notFound } from 'next/navigation'
import { getPlant } from '@/lib/db/plants'
import { getAuthenticatedUser } from '@/lib/auth'
import { PlantForm } from '@/components/PlantForm'

export default async function EditPlantPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const user = await getAuthenticatedUser()
  const plant = await getPlant(id, user?.id ?? '')

  if (!plant) notFound()

  return (
    <main className="flex-1 px-4 py-6 pb-28">
      <PlantForm plant={plant} />
    </main>
  )
}
