import { getPlants } from '@/lib/db/plants'
import { BottomTabBar } from '@/components/BottomTabBar'
import { PlantCard } from '@/components/PlantCard'
import { getAuthenticatedUser } from '@/lib/auth'

export default async function PlantsPage() {
  const user = await getAuthenticatedUser()
  const plants = await getPlants(user?.id ?? '')
  const today = new Date()

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <header className="bg-slate-900 px-6 py-5 text-slate-50">
        <h1 className="text-2xl font-bold">My Plants</h1>
        <p className="mt-0.5 text-sm text-slate-400">
          {plants.length} plant{plants.length !== 1 ? 's' : ''}
        </p>
      </header>

      <main className="flex-1 px-4 py-4 pb-28 space-y-3">
        {plants.length === 0 ? (
          <p className="py-16 text-center text-slate-400">
            No plants yet — add your first one!
          </p>
        ) : (
          plants.map(plant => (
            <PlantCard key={plant.id} plant={plant} today={today} />
          ))
        )}
      </main>

      <BottomTabBar />
    </div>
  )
}
