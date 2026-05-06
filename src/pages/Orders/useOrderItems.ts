import { useEffect, useState } from "react";
import OrdersService from "../../services/OrderService";
import type { OrderItem } from "../../types/OrderType";

function useOrderItems(orderId?: string) {
  const [items, setItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId) return;

    async function loadItems() {
      try {
        setLoading(true);
        const data = await OrdersService.getOrderItems(Number(orderId));
        setItems(data);
      } catch (e) {
        setError("Erro ao carregar itens");
      } finally {
        setLoading(false);
      }
    }

    loadItems();
  }, [orderId]);

  return { items, loading, error };
}

export default useOrderItems;
