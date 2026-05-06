import { useNavigate } from "react-router-dom";
import type { Order } from "../../../types/OrderType";

type Props = {
  order: Order;
};

function ProductionCard({ order }: Props) {
  const navigate = useNavigate();

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

  return (
    <div
      onClick={() => navigate(`/orders/${order.id}`)}
      className={`relative px-2 py-1 border rounded-md cursor-pointer active:scale-95 transition ${bgColor} flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 w-full`}
    >
      <div className="min-w-0 w-full">
        <p className="font-semibold truncate">{order.customerName}</p>
        <p className="text-sm">
          Prazo: {data.toLocaleDateString("pt-BR")}
        </p>
        <p className="text-sm break-all">Pedido: {order.id}</p>
      </div>
    </div>
  );
}

export default ProductionCard;
