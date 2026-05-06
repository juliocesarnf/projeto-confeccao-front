export type Order = {
  id: number;
  createdAt: string;
  status: string;
  totalValue: string;
  dueDate: string;
  customerName: string;
  totalItems: string;
  totalQuantity: string;
};

export type OrderItem = {
  id: number;
  quantity: number;
  unitPrice: number;
  fulfilledQuantity: number;
  status: string;
  product: {
    id: number;
    name: string;
  };
  variation: {
    id: number;
    size: string;
    color: string;
    sku: string;
  };
 
};