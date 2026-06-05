import { createContext, useContext, useState, type ReactNode } from "react";
import type { Product, ProductVariation } from "../types/ProductType";

type ProductContextType = {
  selectedProduct: Product | null;
  setSelectedProduct: React.Dispatch<React.SetStateAction<Product | null>>;
  selectedVariation: ProductVariation | null;
  setSelectedVariation: React.Dispatch<React.SetStateAction<ProductVariation | null>>;
};

const ProductContext = createContext<ProductContextType | null>(null);

type ProductProviderProps = {
  children: ReactNode;
};

export function ProductProvider({ children }: ProductProviderProps) {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedVariation, setSelectedVariation] = useState<ProductVariation | null>(null);

  return (
    <ProductContext.Provider value={{ selectedProduct, setSelectedProduct, selectedVariation, setSelectedVariation }}>
      {children}
    </ProductContext.Provider>
  );
}

export function useProduct() {
  const context = useContext(ProductContext);

  if (!context) {
    throw new Error("useProduct must be used within a ProductProvider");
  }

  return context;
}
