import { Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useProduction } from "../../../context/ProductionContext";
import type { Pedido } from "../../../types/OrderType";

type Props = {
  order: Pedido;
};

function NewCard({ order }: Props) {
  const navigate = useNavigate();
  const { setOrder } = useProduction();

  const data = new Date(order.prazo);
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
      onClick={() => {
        setOrder(order);
        navigate(`/orders/${order.id}`);
      }}
      className={`relative px-2 py-1 border rounded-md cursor-pointer active:scale-95 transition ${bgColor} flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 w-full`}
    >
      {order.enoughPieces && (
        <Check className="absolute top-2 right-2 w-7 h-7 text-green-600" />
      )}

      <div className="min-w-0 w-full">
        <p className="font-semibold truncate">{order.cliente_nome}</p>
        <p className="text-sm">
          Prazo: {data.toLocaleDateString("pt-BR")}
        </p>
        <p className="text-sm break-all">Pedido: {order.id}</p>
      </div>
    </div>
  );
}

export default NewCard;