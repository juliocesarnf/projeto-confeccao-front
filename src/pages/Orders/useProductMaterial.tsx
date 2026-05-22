import { useEffect, useState } from "react";
import ProductsService from "../../services/ProductService";
import type { ProductMaterial } from "../../types/MaterialType";

function useProductMaterial(productId?: string) {
  const [productMaterial, setProductMaterial] = useState<ProductMaterial[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!productId) return;

    async function loadProductMaterial() {
      try {
        setLoading(true);

        const data = await ProductsService.getProductMaterialsById(Number(productId));

        setProductMaterial(data);

      } catch {
        setError("Erro ao carregar materiais do produto");
      } finally {
        setLoading(false);
      }
    }

    loadProductMaterial();
  }, [productId]);

  return {
    productMaterial,
    loading,
    error,
  };
}

export default useProductMaterial;
