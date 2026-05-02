// app/guest/page.tsx
import { cookies } from 'next/headers'
import { decodeGuestJwtClaims } from '@/lib/guest-jwt'
import { createGuestClient } from '@/lib/supabase/guest'
import { getGuestGarden, getGuestPlants } from '@/lib/db/guest'
import { GuestPlantList } from '@/components/GuestPlantList'

const sessionExpiredUi = (
  <main className="min-h-screen bg-brand-bg p-6 text-brand-fg flex items-center justify-center">
    <p className="text-brand-fg-dim text-center">
      Reopen the original link to continue.
    </p>
  </main>
)

export default async function GuestPage() {
  const cookieStore = await cookies()
  const guestJwt = cookieStore.get('guest_jwt')?.value

  if (!guestJwt) return sessionExpiredUi

  const claims = decodeGuestJwtClaims(guestJwt)
  if (!claims) return sessionExpiredUi

  const client = createGuestClient(guestJwt)

  const [garden, plants] = await Promise.all([
    getGuestGarden(client, claims.gardenId),
    getGuestPlants(client, claims.gardenId),
  ])

  if (!garden) {
    return (
      <main className="min-h-screen bg-brand-bg p-6 text-brand-fg flex items-center justify-center">
        <p className="text-brand-fg-dim text-center">
          This link is invalid or has expired.
        </p>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-brand-bg p-6 text-brand-fg">
      <h1 className="text-2xl font-bold mb-6">{garden.name}</h1>
      <GuestPlantList initialPlants={plants} />
    </main>
  )
}
