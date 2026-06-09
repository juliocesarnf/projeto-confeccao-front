import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import OrderService from "../../../services/OrderService";
import type { Order } from "../../../types/OrderType";

type Props = {
  order: Order;
};

function DoneCard({ order }: Props) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const data = new Date(order.dueDate);
  const hoje = new Date();

  const diffTime = data.getTime() - hoje.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  let bgColor = "bg-blue-50";
  if (diffDays <= 1) {
    bgColor = "bg-red-100";
  } else if (diffDays <= 3) {
    bgColor = "bg-yellow-100";
  }

  const handleDeliver = async () => {
    try {
      setLoading(true);
      const result = await OrderService.deliverOrder(order.id);
      navigate("/orders", {
        state: { notification: { type: "success", message: result.message } },
      });
    } catch {
      toast.error("Erro ao entregar pedido.", { position: "top-right", autoClose: 4000 });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`px-2 py-1 border rounded-md ${bgColor} flex justify-between items-center gap-2 w-full`}
    >
      {/* infos */}
      <div className="min-w-0">
        <p className="font-semibold truncate">
          {order.customerName}
        </p>
        <p className="text-sm">
          Prazo: {data.toLocaleDateString("pt-BR")}
        </p>
        <p className="text-sm">
          Pedido: {order.id.toString().padStart(6, '0')}
        </p>
      </div>

      {/* botão lateral */}
      <button
        onClick={handleDeliver}
        disabled={loading}
        className="px-4 py-2 rounded-md bg-teal-600 text-lg text-white hover:bg-teal-700 disabled:opacity-50 transition whitespace-nowrap"
      >
        {loading ? "..." : "Enviar"}
      </button>
    </div>
  );
}

export default DoneCard;
