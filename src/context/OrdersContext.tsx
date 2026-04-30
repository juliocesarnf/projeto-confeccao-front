import { createContext, useContext, useEffect, useState } from "react";
import OrdersService from "../services/OrdersService";

const OrdersContext = createContext<any>(null);

export function OrdersProvider({ children }: any) {
  const [orders, setOrders] = useState([]);

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