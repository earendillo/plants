'use client'

import { useLocale } from 'next-intl'

export function LanguageSelector() {
  const locale = useLocale()

  function switchTo(next: string) {
    document.cookie = `NEXT_LOCALE=${next};path=/;max-age=31536000`
    window.location.reload()
  }

  return (
    <div className="flex items-center gap-1 px-3 text-xs font-semibold text-brand-fg-dim">
      <button
        onClick={() => switchTo('en')}
        className={locale === 'en' ? 'text-brand-fg' : 'hover:text-brand-fg-sub transition-colors'}
      >
        EN
      </button>
      <span className="opacity-30">/</span>
      <button
        onClick={() => switchTo('pl')}
        className={locale === 'pl' ? 'text-brand-fg' : 'hover:text-brand-fg-sub transition-colors'}
      >
        PL
      </button>
    </div>
  )
}
