import { notFound } from 'next/navigation'
import { cookies } from 'next/headers'
import { getPlant } from '@/lib/db/plants'
import { MOCK_USER_ID } from '@/lib/auth'
import { BottomTabBar } from '@/components/BottomTabBar'
import { PlantForm } from '@/components/PlantForm'

export default async function EditPlantPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const cookieStore = await cookies()
  const userId = cookieStore.get('userId')?.value ?? MOCK_USER_ID
  const plant = await getPlant(id, userId)

  if (!plant) notFound()

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <header className="bg-slate-900 px-6 py-5 text-slate-50">
        <h1 className="text-2xl font-bold">Edit Plant</h1>
      </header>
      <main className="flex-1 px-4 py-6 pb-28">
        <PlantForm plant={plant} />
      </main>
      <BottomTabBar />
    </div>
  )
}
