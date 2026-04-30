import { NavLink } from "react-router-dom"
import { Box, BarChart, FileText } from "lucide-react"

export function BottomNav() {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 w-full bg-gray-800 text-white flex justify-around p-3">
      <NavLink
        to="/orders"
        className={({ isActive }) =>
          `flex flex-col items-center text-sm ${
            isActive ? "text-blue-400" : ""
          }`
        }
      >
        <FileText className="w-5 h-5" />
        Pedidos
      </NavLink>

      <NavLink
        to="/inventory"
        className={({ isActive }) =>
          `flex flex-col items-center text-sm ${
            isActive ? "text-blue-400" : ""
          }`
        }
      >
        <Box className="w-5 h-5" />
        Estoque
      </NavLink>

      <NavLink
        to="/reports"
        className={({ isActive }) =>
          `flex flex-col items-center text-sm ${
            isActive ? "text-blue-400" : ""
          }`
        }
      >
        <BarChart className="w-5 h-5" />
        Relatórios
      </NavLink>
    </nav>
  )
}