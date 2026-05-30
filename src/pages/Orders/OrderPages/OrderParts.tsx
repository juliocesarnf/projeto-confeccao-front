import {
  type ButtonHTMLAttributes,
  type ReactNode,
  useEffect,
  useState,
} from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useProduction } from "../../../context/ProductionContext";
import type { ProductToDo } from "../../../types/ProductType";
import OrderService from "../../../services/OrderService";
import OrderHeader from "../Header/OrderHeader";
import Loading from "../../../components/Loading";
import type { OrderItem } from "../../../types/OrderType";
import { toast } from "react-toastify";

type ViewMode = "required" | "stock";

// Agrupa itens por produto, retornando um produto com suas variações
type GroupedProduct = {
  productId: number;
  productName: string;
  variations: {
    item: OrderItem;
    quantity: number;
  }[];
  totalQuantity: number;
};

function groupByProduct(items: OrderItem[], view: ViewMode): GroupedProduct[] {
  const map = new Map<number, GroupedProduct>();

  for (const item of items) {
    const quantity = getVisibleQuantity(item, view);
    const existing = map.get(item.product.id);

    if (existing) {
      existing.variations.push({ item, quantity });
      existing.totalQuantity += quantity;
    } else {
      map.set(item.product.id, {
        productId: item.product.id,
        productName: item.product.name,
        variations: [{ item, quantity }],
        totalQuantity: quantity,
      });
    }
  }

  return Array.from(map.values());
}

function OrderParts(): ReactNode {
  const navigate = useNavigate();
  const {
    order,
    orderItems,
    setOrderItems,
    setOrderProducts,
    setOrderProductsVariations,
  } = useProduction();

  const [view, setView] = useState<ViewMode>("required");
  const [loadingTable, setLoadingTable] = useState(true);
  const [confirmingOrder, setConfirmingOrder] = useState(false);

  useEffect(() => {
    if (!order) {
      setOrderItems([]);
      setLoadingTable(false);
      return;
    }

    const loadItems = async () => {
      const items = await OrderService.getOrderItems(order.id);
      setOrderItems(items);
      setLoadingTable(false);
    };

    loadItems();
  }, [order, setOrderItems]);

  if (!order) return <p>Order not found</p>;

  const stockItems = orderItems.filter((item) => item.fulfilledQuantity > 0);
  const requiredItems = orderItems.filter(
    (item) => getMissingQuantity(item) > 0
  );
  const visibleItems = view === "stock" ? stockItems : requiredItems;

  const groupedProducts = groupByProduct(visibleItems, view);

  const handleStartProduction = () => {
    setOrderItems(requiredItems);
    setOrderProducts(groupRequiredProducts(requiredItems));
    setOrderProductsVariations(
      requiredItems.map((item) => ({
        productVariationId: item.variation.id,
        quantityRequired: getMissingQuantity(item),
      }))
    );
    navigate(`/orders/${order.id}/materials`);
  };

  const handleConfirmOrder = async () => {
    setConfirmingOrder(true);

    try {
      const response = await OrderService.confirmOrder(order.id);

      navigate("/orders", {
        state: {
          notification: {
            type: "success",
            message: response.message,
            status: response.status,
          },
          selectedStatus: "confirmado",
        },
      });
    } catch (error: any) {
      const status = error.response?.status;
      const msg =
        error.response?.data?.message ??
        "Erro inesperado ao confirmar pedido.";

      toast.error(status ? `Erro ${status}: ${msg}` : msg, {
        position: "top-right",
        autoClose: 5000,
      });
    } finally {
      setConfirmingOrder(false);
    }
  };

  const actionButton = order.enoughItems
    ? {
        label: confirmingOrder ? "Confirmando..." : "Confirmar Pedido",
        onClick: handleConfirmOrder,
        className:
          "mt-2 w-full py-3 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700 transition disabled:cursor-not-allowed disabled:bg-green-300",
      }
    : {
        label: "Iniciar Produção",
        onClick: handleStartProduction,
        className:
          "mt-2 w-full py-3 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition disabled:cursor-not-allowed disabled:bg-blue-300",
      };

  return (
    <div className="w-full max-w-4xl mx-auto px-1 sm:px-4 py-4">
      <button
        onClick={() => navigate(-1)}
        className="mb-3 text-sm text-gray-500 hover:text-gray-700"
      >
        <ArrowLeft size={20} />
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

        <div className="flex flex-col">
          {loadingTable ? (
            <div className="flex justify-center items-center py-10">
              <Loading />
            </div>
          ) : groupedProducts.length === 0 ? (
            <div className="p-6 text-center text-sm text-gray-500">
              Nenhum item encontrado.
            </div>
          ) : (
            <div className="flex flex-col divide-y">
              {groupedProducts.map((group) => (
                <ProductGroup key={group.productId} group={group} view={view} />
              ))}
            </div>
          )}
        </div>

        <button
          onClick={actionButton.onClick}
          disabled={loadingTable || confirmingOrder}
          className={actionButton.className}
        >
          {actionButton.label}
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

type ProductGroupProps = {
  group: GroupedProduct;
  view: ViewMode;
};

function ProductGroup({ group, view }: ProductGroupProps) {
  const accentClass =
    view === "stock"
      ? "bg-green-50 text-green-700"
      : "bg-blue-50 text-blue-700";

  const totalBadgeClass =
    view === "stock"
      ? "bg-green-100 text-green-800 border border-green-200"
      : "bg-blue-100 text-blue-800 border border-blue-200";

  return (
    <div className="py-3 flex flex-col gap-2">
      <div className="flex justify-between items-center">
        <span className="font-semibold text-gray-800">
          {group.productName}
        </span>
        <span
          className={`px-3 py-1 rounded-md text-sm font-semibold ${totalBadgeClass}`}
        >
          x{group.totalQuantity}
        </span>
      </div>

      <div className="flex flex-col gap-1 pl-3 border-l-2 border-gray-100">
        {group.variations.map(({ item, quantity }) => (
          <div
            key={item.id}
            className="flex justify-between items-center"
          >
            <div className="flex flex-col">
              <span className="text-sm text-gray-600">
                {item.variation.size} · {item.variation.color}
              </span>
              <span className="text-xs text-gray-400">
                {item.variation.sku}
              </span>
            </div>
            <span
              className={`px-2 py-0.5 rounded text-sm font-medium ${accentClass}`}
            >
              x{quantity}
            </span>
          </div>
        ))}
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
