import { getTranslations } from 'next-intl/server'

export default async function Loading() {
  const t = await getTranslations('plantEdit')

  return (
    <>
      <header className="border-b border-white/6 px-6 py-5">
        <h1 className="text-2xl text-brand-fg">{t('title')}</h1>
      </header>
      <main className="flex-1 px-4 py-6 pb-28 space-y-5">
        {[0, 1, 2, 3].map(i => (
          <div key={i} className="space-y-1.5">
            <div className="h-3 w-20 animate-pulse rounded-full bg-white/10" />
            <div className="h-12 animate-pulse rounded-lg bg-brand-surface border border-white/6" />
          </div>
        ))}
        <div className="h-14 animate-pulse rounded-lg bg-brand-cta/20" />
        <div className="h-12 animate-pulse rounded-lg border border-brand-alert/20" />
      </main>
    </>
  )
}
