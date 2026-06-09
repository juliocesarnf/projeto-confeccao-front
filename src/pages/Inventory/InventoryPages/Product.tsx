import { useEffect, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";

import { useProduct } from "../../../context/ProductContext";
import ProductService from "../../../services/ProductService";
import type { ProductVariation } from "../../../types/ProductType";
import ProductHeader from "../Header/ProductHeader";
import ProductVariationCard from "../Cards/ProductVariationCard";

function Product(): ReactNode {
  const { selectedProduct } = useProduct();
  const navigate = useNavigate();
  const [variations, setVariations] = useState<ProductVariation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!selectedProduct) {
      navigate("/inventory");
      return;
    }

    const fetchVariations = async () => {
      try {
        setLoading(true);
        const data = await ProductService.getVariationsByProductId(selectedProduct.id);
        setVariations(data);
      } catch {
        // Erro já notificado pelo interceptor da API.
      } finally {
        setLoading(false);
      }
    };

    fetchVariations();
  }, [selectedProduct, navigate]);

  if (!selectedProduct) return null;

  return (
    <div className="w-full max-w-6xl flex flex-col gap-4 px-0 sm:px-4">

      <ProductHeader />

      {/* Variações */}
      <div>
        <h2 className="text-sm font-medium text-gray-500 mb-2">Variações</h2>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="w-8 h-8 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
          </div>
        ) : variations.length === 0 ? (
          <p className="text-center text-gray-400 text-sm py-8">
            Nenhuma variação cadastrada.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {[...variations].sort((a, b) => b.stock - a.stock).map((v) => (
              <ProductVariationCard key={v.id} variation={v} />
            ))}
          </div>
        )}
      </div>

    </div>
  );
}

export default Product;
