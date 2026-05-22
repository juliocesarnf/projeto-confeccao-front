import type { Order, OrderItem } from "../types/OrderType";
import API from "./API";

// ─── Service ──────────────────────────────────────────────────────────────────

const OrderService = {

  async getAllOrders(): Promise<Order[]> {
    const response = await API.get<Order[]>("/pedidos");
    return response.data;
  },

  async listAll(): Promise<Order[]> {
    return this.getAllOrders();
  },

  async getOrderItems(id: number): Promise<OrderItem[]> {
    const response = await API.get<OrderItem[]>(`/pedidos/${id}/items`);
    return response.data;
  },

  async confirmOrder(id: number): Promise<{ status: number; message: string }> {
    const response = await API.patch(`/pedidos/${id}/confirmar`);

    return {
      status: response.status,
      message:
        response.data?.message ??
        response.data?.msg ??
        "Pedido confirmado com sucesso.",
    };
  },

};

export default OrderService;
