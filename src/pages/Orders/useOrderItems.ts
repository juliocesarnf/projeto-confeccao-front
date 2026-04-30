import { useEffect, useState } from "react";
import OrdersService from "../../services/OrdersService";

export interface OrderItem {
  id: number;
  quantidade: number;
  quantidade_atendida: number;
  preco_unitario: number;
  status: string;

  produto: {
    id: number;
    nome: string;
  };

  variacao: {
    id: number;
    tamanho: string;
    cor: string;
    sku: string;
  };
}

function useOrderItems(orderId?: string) {
  const [items, setItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId) return;

    async function loadItems() {
      try {
        setLoading(true);

        const data = await OrdersService.listOrderItems(Number(orderId));
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