export type ProductProcess = {
  id: number;
  name: string;
  processId: number;
  stepOrder: number;
  estimatedTime: string;
};

export type ProductToDo = {
  productId: number;
  name: string;
  quantity: number;
  processes?: ProductProcess[];
};

export type OrderTeamAssignment = {
  productId: number;
  processId: number;
  employeeId: number | null;
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
