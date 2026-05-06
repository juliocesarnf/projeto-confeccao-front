import type { Order, OrderItem } from "../types/OrderType";
import API from "./API"

const OrderService = {

  async listAll(): Promise<Order[]> {
    const response = await API.get<Order[]>('/pedidos');
    return response.data;
  },

  async getOrderItems(id: number): Promise<OrderItem[]> {
    const response = await API.get<OrderItem[]>(`/pedidos/${id}/items`);
    return response.data
  }
  
}

export default OrderService;
