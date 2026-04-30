export type ProductProcess = {
  id: number;
  nome: string;
};

export type ProductToDo = {
  id_Produto: number;
  nome: string;
  quantidade: number;
  processos?: ProductProcess[];
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