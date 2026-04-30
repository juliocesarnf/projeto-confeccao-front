import { type ReactNode, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import useOrders from "../useOrders";
import useOrderItems from "../useOrderItems";
import { useProduction } from "../../../context/ProductionContext";
import type { ProductToDo } from "../../../types/ProductType";

function OrderParts(): ReactNode {
  const { id } = useParams();
  const navigate = useNavigate();

  const { orders, loading, error } = useOrders();
  const { items, loading: loadingItems } = useOrderItems(id);
  const { setOrderProductsVariations, setOrderProducts } = useProduction();

  const [view, setView] = useState<"required" | "stock">("required");

  // =========================
  // LOADING & ERROR
  // =========================
  if (loading || loadingItems) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  // =========================
  // ORDER DATA
  // =========================
  const order = orders.find(o => String(o.id) === String(id));

  if (!order) return <p>Order not found</p>;

  // =========================
  // DATE / STATUS
  // =========================
  const dueDate = new Date(order.prazo);
  const today = new Date();

  const diffDays = Math.ceil(
    (dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );

  const statusColor =
    diffDays <= 1
      ? "text-red-600"
      : diffDays <= 3
      ? "text-yellow-600"
      : "text-blue-600";

  // =========================
  // ITEMS LOGIC
  // =========================
  const stockItems = items.filter(item => item.quantidade_atendida > 0);

  const requiredItems = items.filter(
    item => item.quantidade - item.quantidade_atendida > 0
  );

  const visibleItems =
    view === "stock" ? stockItems : requiredItems;

  // =========================
  // ACTIONS
  // =========================
  function handleStartProduction() {
    if(!order){
      return
    }
    const productsToProduce: ProductToDo[] = [];

    requiredItems.forEach(item => {
      const quantity = item.quantidade - item.quantidade_atendida;
      const existingProduct = productsToProduce.find(p => p.id_Produto === item.produto.id);

      if (existingProduct) {
        existingProduct.quantidade += quantity;
      } else {
        productsToProduce.push({
          id_Produto: item.produto.id,
          nome: item.produto.nome,
          quantidade: quantity
        });
      }
    });

    setOrderProducts(productsToProduce);

    const productsToProduceVariations = requiredItems.map(item => ({
      productVariationId: item.variacao.id,
      quantityRequired: item.quantidade - item.quantidade_atendida
    }));

    setOrderProductsVariations(productsToProduceVariations);
    navigate(`/orders/${order.id}/materials`);
  }

  function getQuantity(item: any) {
    return view === "stock"
      ? item.quantidade_atendida
      : item.quantidade - item.quantidade_atendida;
  }

  // =========================
  // RENDER
  // =========================
  return (
    <div className="w-full max-w-4xl mx-auto px-2 sm:px-4 py-4">
      
      {/* BACK */}
      <button
        onClick={() => navigate(-1)}
        className="mb-3 text-sm text-gray-500 hover:text-gray-700"
      >
        ← Back
      </button>

      {/* CARD */}
      <div className="bg-white border rounded-xl shadow-sm p-4 flex flex-col gap-4">

        {/* HEADER */}
        <header className="flex flex-col gap-3 border-b pb-3">
          <div>
            <h1 className="text-xl font-semibold">
              Order #{order.id}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Peças Necessárias
            </p>
          </div>

          <div className="text-sm text-gray-500 flex flex-wrap gap-4">
            <span>
              Due date:{" "}
              <span className={`font-medium ${statusColor}`}>
                {dueDate.toLocaleDateString("en-US")}
              </span>
            </span>

            <span>
              Total:{" "}
              <span className="font-medium text-gray-800">
                $ {Number(order.valor_total || 0).toFixed(2)}
              </span>
            </span>
          </div>
        </header>

        {/* TABS */}
        <div className="flex gap-2">
          <TabButton
            active={view === "required"}
            color="blue"
            onClick={() => setView("required")}
          >
            Necessários ({requiredItems.length})
          </TabButton>

          <TabButton
            active={view === "stock"}
            color="green"
            onClick={() => setView("stock")}
          >
            Em Estoque ({stockItems.length})
          </TabButton>
        </div>

        {/* LIST */}
        <div className="flex flex-col divide-y">
          {visibleItems.map(item => (
            <ItemRow
              key={item.id}
              item={item}
              quantity={getQuantity(item)}
              view={view}
            />
          ))}
        </div>

        {/* FOOTER */}
        {!order ? (
          <button
            onClick={() => console.log("Move to shipping")}
            className="mt-2 w-full py-3 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700 transition"
          >
            Move to Shipping
          </button>
        ) : (
          <button
            onClick={handleStartProduction}
            className="mt-2 w-full py-3 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition"
          >
            Iniciar Produção
          </button>
        )}
      </div>
    </div>
  );
}

// =========================
// AUX COMPONENTS
// =========================

function TabButton({
  children,
  active,
  color,
  ...props
}: any) {
  const base = "flex-1 py-2 rounded-md text-sm font-medium transition";

  const styles = active
    ? color === "blue"
      ? "bg-blue-600 text-white"
      : "bg-green-600 text-white"
    : "bg-gray-100 text-gray-600";

  return (
    <button className={`${base} ${styles}`} {...props}>
      {children}
    </button>
  );
}

function ItemRow({ item, quantity, view }: any) {
  return (
    <div className="py-3 flex justify-between items-center">
      <div className="flex flex-col">
        <span className="font-medium">
          {item.produto.nome}
        </span>

        <span className="text-xs text-gray-500">
          SKU: {item.variacao.sku} • {item.variacao.tamanho} • {item.variacao.cor}
        </span>

        <span className="text-xs text-gray-500">
          $ {Number(item.preco_unitario).toFixed(2)} each
        </span>
      </div>

      <div
        className={`px-3 py-1 rounded-md text-sm font-medium
          ${view === "stock"
            ? "bg-green-50 text-green-700"
            : "bg-blue-50 text-blue-700"}`}
      >
        x{quantity}
      </div>
    </div>
  );
}

export default OrderParts;