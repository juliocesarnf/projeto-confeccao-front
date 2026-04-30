import { NavLink, useLocation } from "react-router-dom"
import { Box, BarChart, FileText } from "lucide-react"

export function Sidebar() {
  const location = useLocation()

  const isOrdersActive =
    location.pathname === "/" ||
    location.pathname.startsWith("/orders")

  const baseStyle =
    "relative flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-200"

  return (
    <aside className="hidden md:flex flex-col w-64 h-screen bg-gray-900 text-white fixed left-0 top-0 p-4">
      <h1 className="text-xl font-bold mb-6">Menu</h1>

      <nav className="flex flex-col gap-2">
        {/* PEDIDOS */}
        <NavLink
          to="/orders"
          className={`${baseStyle} ${
            isOrdersActive
              ? "bg-gray-800 text-blue-400 font-semibold"
              : "hover:bg-gray-800 hover:text-gray-300"
          }`}
        >
          <>
            {isOrdersActive && (
              <span className="absolute left-0 top-0 h-full w-1 bg-blue-500 rounded-r-md" />
            )}

            <FileText size={20} />
            Pedidos
          </>
        </NavLink>

        {/* ESTOQUE */}
        <NavLink
          to="/inventory"
          className={({ isActive }) =>
            `${baseStyle} ${
              isActive
                ? "bg-gray-800 text-blue-400 font-semibold"
                : "hover:bg-gray-800 hover:text-gray-300"
            }`
          }
        >
          {({ isActive }) => (
            <>
              {isActive && (
                <span className="absolute left-0 top-0 h-full w-1 bg-blue-500 rounded-r-md" />
              )}

              <Box size={20} />
              Estoque
            </>
          )}
        </NavLink>

        {/* RELATÓRIOS */}
        <NavLink
          to="/reports"
          className={({ isActive }) =>
            `${baseStyle} ${
              isActive
                ? "bg-gray-800 text-blue-400 font-semibold"
                : "hover:bg-gray-800 hover:text-gray-300"
            }`
          }
        >
          {({ isActive }) => (
            <>
              {isActive && (
                <span className="absolute left-0 top-0 h-full w-1 bg-blue-500 rounded-r-md" />
              )}

              <BarChart size={20} />
              Relatórios
            </>
          )}
        </NavLink>
      </nav>
    </aside>
  )
}