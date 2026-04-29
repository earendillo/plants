// app/guest/[token]/page.tsx
import { GuestTokenValidator } from '@/components/GuestTokenValidator'

type Props = { params: Promise<{ token: string }> }

export default async function GuestTokenPage({ params }: Props) {
  const { token } = await params
  return <GuestTokenValidator token={token} />
}
