import {
  type ButtonHTMLAttributes,
  type ReactNode,
  useEffect,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";
import { useProduction } from "../../../context/ProductionContext";
import type { ProductToDo } from "../../../types/ProductType";
import OrderService from "../../../services/OrderService";
import OrderHeader from "../Header/OrderHeader";
import type { OrderItem } from "../../../types/OrderType";

type ViewMode = "required" | "stock";

function OrderParts(): ReactNode {
  const navigate = useNavigate();
  const {
    order,
    setOrderProducts,
    setOrderProductsVariations,
  } = useProduction();

  const [items, setItems] = useState<OrderItem[]>([]);
  const [view, setView] = useState<ViewMode>("required");

  useEffect(() => {
    if (!order) return;

    const loadItems = async () => {
      const orderItems = await OrderService.getOrderItems(order.id);
      setItems(orderItems);
    };

    loadItems();
  }, [order]);

  if (!order) return <p>Order not found</p>;

  // Separa as pecas ja atendidas em estoque das que ainda precisam ser produzidas.
  const stockItems = items.filter((item) => item.fulfilledQuantity > 0);
  const requiredItems = items.filter(
    (item) => getMissingQuantity(item) > 0
  );
  const visibleItems = view === "stock" ? stockItems : requiredItems;

  const handleStartProduction = () => {
    // Agrupa variacoes do mesmo produto para alimentar as proximas etapas.
    setOrderProducts(groupRequiredProducts(requiredItems));
    setOrderProductsVariations(
      requiredItems.map((item) => ({
        productVariationId: item.variation.id,
        quantityRequired: getMissingQuantity(item),
      }))
    );

    navigate(`/orders/${order.id}/materials`);
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-2 sm:px-4 py-4">
      <button
        onClick={() => navigate(-1)}
        className="mb-3 text-sm text-gray-500 hover:text-gray-700"
      >
        Back
      </button>

      <div className="bg-white border rounded-xl shadow-sm p-4 flex flex-col gap-4">
        <OrderHeader title="Peças do Pedido" />

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

        <div className="flex flex-col divide-y">
          {visibleItems.map((item) => (
            <ItemRow
              key={item.id}
              item={item}
              quantity={getVisibleQuantity(item, view)}
              view={view}
            />
          ))}
        </div>

        <button
          onClick={handleStartProduction}
          className="mt-2 w-full py-3 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition"
        >
          Iniciar Produção
        </button>
      </div>
    </div>
  );
}

type TabButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  active: boolean;
  color: "blue" | "green";
};

function TabButton({ children, active, color, ...props }: TabButtonProps) {
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

type ItemRowProps = {
  item: OrderItem;
  quantity: number;
  view: ViewMode;
};

function ItemRow({ item, quantity, view }: ItemRowProps) {
  return (
    <div className="py-3 flex justify-between items-center">
      <div className="flex flex-col">
        <span className="font-medium">{item.product.name}</span>

        <span className="text-xs text-gray-500">
          SKU: {item.variation.sku} • {item.variation.size} • {item.variation.color}
        </span>

        <span className="text-xs text-gray-500">
          $ {Number(item.unitPrice).toFixed(2)} each
        </span>
      </div>

      <div
        className={`px-3 py-1 rounded-md text-sm font-medium ${
          view === "stock"
            ? "bg-green-50 text-green-700"
            : "bg-blue-50 text-blue-700"
        }`}
      >
        x{quantity}
      </div>
    </div>
  );
}

function getMissingQuantity(item: OrderItem) {
  return item.quantity - item.fulfilledQuantity;
}

function getVisibleQuantity(item: OrderItem, view: ViewMode) {
  return view === "stock" ? item.fulfilledQuantity : getMissingQuantity(item);
}

function groupRequiredProducts(requiredItems: OrderItem[]): ProductToDo[] {
  return requiredItems.reduce<ProductToDo[]>((products, item) => {
    const quantity = getMissingQuantity(item);
    const existingProduct = products.find(
      (product) => product.productId === item.product.id
    );

    if (existingProduct) {
      existingProduct.quantity += quantity;
      return products;
    }

    products.push({
      productId: item.product.id,
      name: item.product.name,
      quantity,
    });

    return products;
  }, []);
}

export default OrderParts;
