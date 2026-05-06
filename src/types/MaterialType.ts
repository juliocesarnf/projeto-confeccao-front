export type MaterialVariation = {
  id: number;
  variation: string;
  stock: number;
};

export type Material = {
  id: number;
  name: string;
  baseUnit: string;
};

export type MaterialVariationInfo = {
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
