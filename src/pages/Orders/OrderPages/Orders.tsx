import { useState, type ReactNode } from "react";
import useOrders from "../useOrders";
import NewCard from "../Cards/NewCard";
import DoneCard from "../Cards/DoneCard";
import ProductionCard from "../Cards/ProductionCard";

type OrderStatus = "novo" | "em_producao" | "confirmado";

function Orders(): ReactNode {
  const { orders, loading, error } = useOrders();
  const [status, setStatus] = useState<OrderStatus>("novo");

  const baseClasses =
    "px-2 py-2 flex-1 text-center rounded-md border transition-all duration-200 font-medium text-sm sm:text-base";

  const activeClasses =
    "bg-blue-600 text-white border-blue-600 shadow-sm";

  const inactiveClasses =
    "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100";

  const filteredOrders = orders.filter(
    (order) => order.status === status
  );

  if (loading) return <p>Carregando...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="w-full max-w-6xl flex flex-col gap-4 px-0 sm:px-4">
      
      {/* BOTÕES */}
      <div className="flex justify-center items-center gap-2 w-full">
        <button
          onClick={() => setStatus("novo")}
          className={`${baseClasses} ${
            status === "novo" ? activeClasses : inactiveClasses
          }`}
        >
          Novos
        </button>

        <button
          onClick={() => setStatus("em_producao")}
          className={`${baseClasses} ${
            status === "em_producao" ? activeClasses : inactiveClasses
          }`}
        >
          Produção
        </button>

        <button
          onClick={() => setStatus("confirmado")}
          className={`${baseClasses} ${
            status === "confirmado" ? activeClasses : inactiveClasses
          }`}
        >
          Prontos
        </button>
      </div>

      {/* LISTA */}
      <div className="flex flex-col gap-4">
        {filteredOrders.map((order) => {
          if (status === "novo") {
            return <NewCard key={order.id} order={order} />;
          }

          if (status === "confirmado") {
            return <DoneCard key={order.id} order={order} />;
          }

          return <ProductionCard key={order.id} order={order} />;
        })}
      </div>
    </div>
  );
}

export default Orders;