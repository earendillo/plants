import { PlantForm } from '@/components/PlantForm'
import { getTranslations } from 'next-intl/server'

export default async function NewPlantPage() {
  const t = await getTranslations('plantNew')

  return (
    <>
      <header className="border-b border-white/6 px-6 py-5">
        <h1 className="text-2xl text-brand-fg">{t('title')}</h1>
      </header>
      <main className="flex-1 px-4 py-6 pb-28">
        <PlantForm />
      </main>
    </>
  )
}
