// app/share/[token]/page.tsx
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getAuthenticatedUser } from '@/lib/auth'
import Link from 'next/link'

export default async function ShareAcceptPage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params
  const user = await getAuthenticatedUser()
  if (!user) redirect(`/login?next=/share/${token}`)

  const supabase = await createClient()
  const { data, error } = await supabase.rpc('accept_garden_share_link', {
    p_token: token,
  })

  if (error || !data) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-brand-bg px-4">
        <div className="w-full max-w-sm text-center space-y-4">
          <p className="text-5xl">🌿</p>
          <h1 className="text-xl font-semibold text-brand-fg">Invalid or expired link</h1>
          <p className="text-sm text-brand-fg-dim">
            This share link is no longer valid. Ask the garden owner to send you a new one.
          </p>
          <Link
            href="/today"
            className="inline-block rounded-lg bg-brand-cta px-6 py-3 text-sm font-semibold text-brand-cta-fg hover:brightness-[0.92] transition-[filter]"
          >
            Go to my gardens
          </Link>
        </div>
      </main>
    )
  }

  redirect(`/plants?garden=${data as string}`)
}
