import { Sidebar } from "./Sidebar";
import { BottomNav } from "./BottomNav";

// ─── Component ────────────────────────────────────────────────────────────────

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex">
      <Sidebar />

      <main className="flex-1 min-w-0 md:ml-64 px-2 py-2 pb-16 md:p-4">
        {children}
      </main>

      <BottomNav />
    </div>
  );
}