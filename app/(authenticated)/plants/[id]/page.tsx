import { notFound } from 'next/navigation'
import { getPlant } from '@/lib/db/plants'
import { getAuthenticatedUser } from '@/lib/auth'
import { PlantForm } from '@/components/PlantForm'
import { getTranslations } from 'next-intl/server'

export default async function EditPlantPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const user = await getAuthenticatedUser()
  const plant = await getPlant(id, user?.id ?? '')
  const t = await getTranslations('plantEdit')

  if (!plant) notFound()

  return (
    <>
      <header className="border-b border-white/6 px-6 py-5">
        <h1 className="text-2xl text-brand-fg">{t('title')}</h1>
      </header>
      <main className="flex-1 px-4 py-6 pb-28">
        <PlantForm plant={plant} />
      </main>
    </>
  )
}
