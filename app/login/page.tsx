'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    // TODO: Replace with real JWT / Supabase Auth — any credentials are accepted
    document.cookie = 'isAuthenticated=true; path=/; samesite=lax'
    document.cookie = 'userId=user_1; path=/; samesite=lax'
    localStorage.setItem('isAuthenticated', 'true')
    localStorage.setItem('userId', 'user_1')
    router.push('/today')
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="text-6xl">🌿</div>
          <h1 className="mt-2 text-2xl font-bold text-slate-900">PlantCare</h1>
          <p className="mt-1 text-sm text-slate-500">Sign in to manage your plants</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-slate-700"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
              className="mt-1 block w-full rounded-lg border border-slate-200 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-slate-700"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="mt-1 block w-full rounded-lg border border-slate-200 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-green-600 py-3 text-base font-semibold text-white hover:bg-green-700 active:bg-green-800"
          >
            Sign in
          </button>
        </form>

        <p className="mt-4 text-center text-xs text-slate-400">
          Any email + password works
        </p>
      </div>
    </main>
  )
}
