import { useProduction } from "../../../context/ProductionContext";

interface OrderHeaderProps {
  title: string;
}

function OrderHeader({ title }: OrderHeaderProps) {

  const { order } = useProduction()

  if (!order) return <p>Order not found</p>;

  const dueDate = new Date(order.dueDate);
  const today = new Date();
  const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  const statusColor = diffDays <= 1 ? "text-red-600" : diffDays <= 3 ? "text-yellow-600" : "text-blue-600";

  return (
    <header className="flex flex-col gap-3 border-b pb-3">
      <div>
        <h1 className="text-xl font-semibold text-center">
          {title}
        </h1>
      </div>

      <div className="text-sm text-gray-500 flex justify-between items-center gap-4">
        <span className="font-medium text-gray-800">
          Pedido: {String(order.id).padStart(6, "0")}
        </span>

        <span>
          Prazo:{" "}
          <span className={`font-medium ${statusColor}`}>
            {dueDate.toLocaleDateString("en-US")}
          </span>
        </span>
      </div>
    </header>
  );
}

export default OrderHeader;
