import { getLocale } from 'next-intl/server'
import { TodayPageContent } from '@/components/TodayPageContent'

export default async function TodayPage({
  searchParams,
}: {
  searchParams: Promise<{ garden?: string }>
}) {
  const [{ garden: gardenParam }, locale] = await Promise.all([
    searchParams,
    getLocale(),
  ])

  return <TodayPageContent gardenParam={gardenParam} locale={locale} />
}
