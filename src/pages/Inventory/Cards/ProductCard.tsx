import { Tag } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useProduct } from "../../../context/ProductContext";
import type { Product } from "../../../types/ProductType";

type Props = {
  product: Product;
};

function ProductCard({ product }: Props) {
  const { setSelectedProduct } = useProduct();
  const navigate = useNavigate();

  function handleClick() {
    setSelectedProduct(product);
    navigate("/inventory/product");
  }

  return (
    <div
      onClick={handleClick}
      className="border border-gray-200 rounded-md bg-white px-4 py-3 flex flex-col gap-2 cursor-pointer hover:border-blue-300 hover:shadow-sm transition-all"
    >
      <div className="flex items-start justify-between gap-2">
        <p className="font-semibold text-gray-800 leading-tight">{product.name}</p>
        <span
          className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${
            product.active
              ? "bg-green-100 text-green-700"
              : "bg-gray-100 text-gray-500"
          }`}
        >
          {product.active ? "Ativo" : "Inativo"}
        </span>
      </div>

      {product.category && (
        <div className="flex items-center gap-1 text-xs text-blue-600">
          <Tag className="w-3 h-3" />
          <span>{product.category}</span>
        </div>
      )}
    </div>
  );
}

export default ProductCard;
