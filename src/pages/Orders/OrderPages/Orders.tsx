import { useEffect, useRef, useState, type ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import { toast } from "react-toastify";

import NewCard from "../Cards/NewCard";
import DoneCard from "../Cards/DoneCard";
import ProductionCard from "../Cards/ProductionCard";
import OrdersService from "../../../services/OrderService";
import type { Order } from "../../../types/OrderType";

// ─── Types ───────────────────────────────────────────────────────────────────

type OrderStatus = "novo" | "producao" | "confirmado";

type OrdersLocationState = {
  notification?: {
    type: "success" | "error";
    message: string;
    status?: number;
  };
  selectedStatus?: OrderStatus;
};

// ─── Constants ────────────────────────────────────────────────────────────────

const TAB_CLASSES = {
  base: "px-2 py-2 flex-1 text-center rounded-md border transition-all duration-200 font-medium text-sm sm:text-base",
  active: "bg-blue-600 text-white border-blue-600 shadow-sm",
  inactive: "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100",
};

const TABS: { label: string; value: OrderStatus }[] = [
  { label: "Novos", value: "novo" },
  { label: "Produção", value: "producao" },
  { label: "Prontos", value: "confirmado" },
];

const CARD_MAP: Record<OrderStatus, React.ComponentType<{ order: Order }>> = {
  novo: NewCard,
  producao: ProductionCard,
  confirmado: DoneCard,
};

// ─── Component ────────────────────────────────────────────────────────────────

function Orders(): ReactNode {
  const location = useLocation();
  const navigate = useNavigate();

  const [orders, setOrders]   = useState<Order[]>([]);
  const [status, setStatus]   = useState<OrderStatus>("novo");
  const [loading, setLoading] = useState(true);

  // Dispara o toast correspondente e limpa o state da navegação.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const notified = useRef(false);

  useEffect(() => {
    if (notified.current) return;
    notified.current = true;

    const state = location.state as OrdersLocationState | null;

    if (state?.notification) {
      toast[state.notification.type](state.notification.message, {
        position: "top-right",
        autoClose: 5000,
      });
    }

    if (state?.selectedStatus) {
      setStatus(state.selectedStatus);
    }

    navigate(location.pathname, { replace: true, state: null });
  }, []);

  // Busca os pedidos no servidor.
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const data = await OrdersService.getAllOrders();
        setOrders(data);
      } catch {
        // Erro já notificado pelo interceptor da API.
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const filteredOrders = orders
    .filter((order) => order.status === status)
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  const CardComponent  = CARD_MAP[status];

  return (
    <div className="w-full max-w-6xl flex flex-col gap-4 px-0 sm:px-4">

      {/* Abas de filtro por status */}
      <div className="flex justify-center items-center gap-2 w-full">
        {TABS.map(({ label, value }) => (
          <button
            key={value}
            onClick={() => setStatus(value)}
            className={`${TAB_CLASSES.base} ${status === value ? TAB_CLASSES.active : TAB_CLASSES.inactive}`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* FAB – novo pedido */}
      <button
        onClick={() => navigate("/orders/new")}
        className="fixed bottom-20 right-4 md:bottom-6 md:right-6 w-14 h-14 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white rounded-full shadow-lg flex items-center justify-center transition-all z-40"
        aria-label="Novo pedido"
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* Loading ou lista de pedidos filtrados */}
      {loading ? (
        <div className="fixed inset-0 md:left-64 bottom-16 md:bottom-0 flex justify-center items-center bg-white/60 backdrop-blur-sm z-50">
          <div className="w-10 h-10 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {filteredOrders.map((order) => (
            <CardComponent key={order.id} order={order} />
          ))}
        </div>
      )}

    </div>
  );
}

export default Orders;