import { createContext, useContext, useEffect, useState } from "react";
import OrdersService from "../services/OrderService";
import type { Order } from "../types/OrderType";

const OrdersContext = createContext<any>(null);

export function OrdersProvider({ children }: any) {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    async function load() {
      const response = await OrdersService.listAll();
      setOrders(response);
    }
    load();
  }, []);

  return (
    <OrdersContext.Provider value={{ orders, setOrders }}>
      {children}
    </OrdersContext.Provider>
  );
}

export function useOrders() {
  return useContext(OrdersContext);
}
