export type Product = {
  id: number;
  name: string;
  description?: string;
  category?: string;
  active: boolean;
};

export type ProductVariation = {
  id: number;
  variation: string;
  stock: number;
  productId: number;
};

export type CreateProductPayload = {
  name: string;
  description?: string;
  category?: string;
  active: boolean;
};

export type ProductProcess = {
  id: number;
  name: string;
  processId: number;
  stepOrder: number;
  dificultyLevel: number;
};

export type ProductToDo = {
  productId: number;
  name: string;
  quantity: number;
  processes?: ProductProcess[];
};

export type ProductProcessesResult = {
  productId: number;
  processes: ProductProcess[];
};

export type OrderTeamAssignment = {
  productId: number;
  processId: number;
  workerId: number | null;
};

export type RequiredProduct = {
  productVariationId: number;
  quantityRequired: number;
};

export type ProductMaterial = {
  id: number;
  quantity: number;

  productVariationId: number;
  productId: number;

  materialVariation: {
    id: number;
    variation: string;
    stock: number;
  };

  material: {
    id: number;
    name: string;
    baseUnit: string;
  };
};
