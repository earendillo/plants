'use client'

import { useLocale } from 'next-intl'

export function LanguageSelector() {
  const locale = useLocale()

  function switchTo(next: string) {
    document.cookie = `NEXT_LOCALE=${next};path=/;max-age=31536000`
    window.location.reload()
  }

  return (
    <div className="flex items-center gap-1 rounded-full bg-black/20 px-2 py-1 text-xs font-semibold text-white">
      <button
        onClick={() => switchTo('en')}
        className={locale === 'en' ? 'opacity-100' : 'opacity-50 hover:opacity-75'}
      >
        EN
      </button>
      <span className="opacity-40">/</span>
      <button
        onClick={() => switchTo('pl')}
        className={locale === 'pl' ? 'opacity-100' : 'opacity-50 hover:opacity-75'}
      >
        PL
      </button>
    </div>
  )
}
