// types/ProductionType.ts

export type StartProductionPayload = {
  orderId: number;

  items: {
    orderItemId: number;
    productVariationId: number;
    plannedQuantity: number;
  }[];

  batches: {
    processId: number;
    stepOrder: number;
    workers: number[];
    items: {
      productVariationId: number;
      quantity: number;
    }[];
  }[];
};

export type StartProductionResponse = {
  status: number;
  message: string;
};

export interface WorkerView {
  workerId: number;
  workerName: string;
  role: string | null;
  startDate: string | null;
  endDate: string | null;
  producedQuantity: number;
}

export interface BatchView {
  batchId: number;
  processId: number;
  processName: string;
  stepOrder: number;
  completed: boolean;
  startDate: string | null;
  endDate: string | null;
  workers: WorkerView[];
}

export interface OrderItemView {
  orderItemId: number;
  productVariationId: number;
  productName: string;
  variationSku: string;
  quantity: number;
  fulfilledQuantity: number;
  status: "pendente" | "parcial" | "atendido";
  batches: BatchView[];
}

export interface ProductionDetailView {
  order: {
    id: number;
    customerId: number;
    customerName: string;
    dueDate: string | null;
    createdAt: string;
    totalValue: number;
    status: string;
  };
  progress: {
    total: number;
    fulfilled: number;
    percentage: number;
  };
  items: {
    fulfilled: OrderItemView[];
    pending: OrderItemView[];
  };
}
