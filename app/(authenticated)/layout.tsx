import { BottomTabBar } from '@/components/BottomTabBar'

export default function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-brand-bg">
      {children}
      <BottomTabBar />
    </div>
  )
}
