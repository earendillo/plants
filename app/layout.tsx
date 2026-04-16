import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import { NextIntlClientProvider } from 'next-intl'
import { getLocale, getMessages } from 'next-intl/server'
import { LanguageSelector } from '@/components/LanguageSelector'
import './globals.css'

const geist = Geist({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'PlantCare',
  description: 'Track your plant watering and feeding schedule',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const locale = await getLocale()
  const messages = await getMessages()

  return (
    <html lang={locale} className={geist.className}>
      <body className="min-h-screen bg-slate-50">
        <NextIntlClientProvider messages={messages}>
          <div className="fixed top-4 right-4 z-50">
            <LanguageSelector />
          </div>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
