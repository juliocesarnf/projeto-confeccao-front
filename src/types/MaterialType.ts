export type MaterialVariation = {
  id: number;
  variation: string;
  stock: number;
};

export type Material = {
  id: number;
  name: string;
  baseUnit: string;
  quantityPerPackage?: number;
};

export type MaterialVariationInfo = {
  materialId: number | null;
  variationId: number;
  material: string;
  variation: string;
  quantity: number;
  baseUnit: string;
};

export type ProductMaterial = {
  id: number;
  productId: number;
  quantity: number;
  productVariationId: number;
  materialVariation: MaterialVariation;
  material: Material;
};

export type ProductMaterialResponse = {
  productId: number;
  productVariationId: number;
  materials: ProductMaterial[];
};

export type RequiredMaterialSupplier = {
  supplierId: number;
  supplierName: string;
  price: number;
};

export type RequiredMaterialSuppliers = {
  materialId: number | null;
  materialName: string;
  suppliers: RequiredMaterialSupplier[];
};
