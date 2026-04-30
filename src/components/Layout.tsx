import { Sidebar } from "./Sidebar"
import { BottomNav } from "./BottomNav"

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex">
      <Sidebar />

      <main className="flex-1 md:ml-64 p-4 pb-16 md:pb-4">
        {children}
      </main>

      <BottomNav />
    </div>
  )
}