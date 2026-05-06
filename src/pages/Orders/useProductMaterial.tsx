import { useEffect, useState } from "react";
import ProductsService from "../../services/ProductService";

export interface ProductMaterial {
  id: number;
  produto_id: number;
  material_id: number;
  quantidade: number;

  material?: {
    id: number;
    nome: string;
  };
}

function useProductMaterial(productId?: string) {
  const [productMaterial, setProductMaterial] = useState<ProductMaterial[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!productId) return;

    async function loadProductMaterial() {
      try {
        setLoading(true);

        const response = await ProductsService.getProductMaterialsById(Number(productId));

        // garante array
        const data = Array.isArray(response)
          ? response
          : response?.data;

        setProductMaterial(data || []);

      } catch (e) {
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