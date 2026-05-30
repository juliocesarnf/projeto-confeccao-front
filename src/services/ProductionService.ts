import type {
  StartProductionPayload,
  StartProductionResponse,
  ProductionDetailView,
} from "../types/ProductionType"
import type { OrderItem } from "../types/OrderType";
import type { ProductToDo, OrderTeamAssignment } from "../types/ProductType";
import API from "./API";

const ProductionService = {

  buildPayload(
    orderId: number,
    orderItems: OrderItem[],
    productsWithProcesses: ProductToDo[],
    assignments: OrderTeamAssignment[]
  ): StartProductionPayload {

    const items = orderItems.map((item) => ({
      orderItemId: item.id,
      productVariationId: item.variation.id,
      plannedQuantity: item.quantity - item.fulfilledQuantity,
    }));

    const batchMap = new Map<number, {
      processId: number;
      stepOrder: number;
      workers: Set<number>;
      items: { productVariationId: number; quantity: number }[];
    }>();

    for (const product of productsWithProcesses) {
      for (const process of product.processes ?? []) {

        // Cria o batch apenas se ainda não existe
        if (!batchMap.has(process.processId)) {
          batchMap.set(process.processId, {
            processId: process.processId,
            stepOrder: process.stepOrder,
            workers: new Set(),
            items: [],
          });
        }

        const batch = batchMap.get(process.processId)!;

        // Adiciona os itens do produto atual no batch
        const productOrderItems = orderItems.filter(
          (item) => item.product.id === product.productId
        );

        for (const orderItem of productOrderItems) {
          batch.items.push({
            productVariationId: orderItem.variation.id,
            quantity: orderItem.quantity - orderItem.fulfilledQuantity,
          });
        }

        // ✅ Sempre adiciona workers, independente de o batch já existir
        assignments
          .filter((a) => a.processId === process.processId && a.productId === product.productId)
          .forEach((a) => {
            if (a.workerId !== null) batch.workers.add(a.workerId);
          });
      }
    }

    const batches = Array.from(batchMap.values()).map((batch) => ({
      processId: batch.processId,
      stepOrder: batch.stepOrder,
      workers: Array.from(batch.workers),
      items: batch.items,
    }));

    return { orderId, items, batches };
  },

  async startProduction(payload: StartProductionPayload): Promise<StartProductionResponse> {
    console.log(payload);
    const response = await API.post("/producao/iniciar", payload);

    return {
      status: response.status,
      message:
        response.data?.message ??
        response.data?.msg ??
        "Produção iniciada com sucesso.",
    };
  },
  async searchProductionByOrderId(id: number): Promise<ProductionDetailView> {
    const response = await API.get(`/producao/search/${id}`);
    return response.data;
  },
  async fulfillItems(orderId: number, itemIds: number[]): Promise<void> {
    await API.patch(`/producao/${orderId}/items/fulfill`, { itemIds });
  },

  async updateBatchStatus(batchId: number, completed: boolean): Promise<void> {
    await API.patch(`/producao/batch/${batchId}/status`, { completed });
  },

};

export default ProductionService;
