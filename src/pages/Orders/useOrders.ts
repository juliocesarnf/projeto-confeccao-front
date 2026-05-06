import { useEffect, useState } from "react";
import OrdersService from "../../services/OrderService";
import type { Order } from "../../types/OrderType";

function useOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadOrders() {
      try {
        setLoading(true);

        const response = await OrdersService.listAll();

        const data = Array.isArray(response) ? response : [];

        setOrders(data);
      } catch (e) {
        setError("Erro ao carregar pedidos");
      } finally {
        setLoading(false);
      }
    }

    loadOrders();
  }, []);

  useEffect(() => {
  }, [orders]);

  return {
    orders,
    loading,
    error,
  };
}

export default useOrders;
