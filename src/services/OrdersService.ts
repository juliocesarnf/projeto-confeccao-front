import API from "./API"

type OrderItem = {
  id: number;
  quantidade: number;
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
};

const OrdersService = {
  async listAll(): Promise<any> {
    const response = await API.get('/pedidos');
    console.log(response.data)
    return response.data;
    
  },

  async listOrderItems(id: number): Promise<OrderItem[]> {
    const response = await API.get(`/pedidos/${id}/items`);
    return response.data;
  }
}

export default OrdersService;