import { BottomTabBar } from '@/components/BottomTabBar'
import { PlantForm } from '@/components/PlantForm'

export default function NewPlantPage() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <header className="bg-slate-900 px-6 py-5 text-slate-50">
        <h1 className="text-2xl font-bold">Add Plant</h1>
      </header>
      <main className="flex-1 px-4 py-6 pb-28">
        <PlantForm />
      </main>
      <BottomTabBar />
    </div>
  )
}
