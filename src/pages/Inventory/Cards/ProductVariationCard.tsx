import { useNavigate } from "react-router-dom";
import { useProduct } from "../../../context/ProductContext";
import type { ProductVariation } from "../../../types/ProductType";

type Props = {
  variation: ProductVariation;
};

function ProductVariationCard({ variation }: Props) {
  const { setSelectedVariation } = useProduct();
  const navigate = useNavigate();

  function handleClick() {
    setSelectedVariation(variation);
    navigate("/inventory/product/update");
  }

  return (
    <div
      onClick={handleClick}
      className="border border-gray-200 rounded-md bg-white px-4 py-3 flex flex-col gap-1 cursor-pointer hover:border-blue-300 hover:shadow-sm transition-all"
    >
      <span className="text-base font-semibold text-gray-800">{variation.variation}</span>
      <span className={`text-xs font-medium ${variation.stock > 0 ? "text-green-600" : "text-red-500"}`}>
        {variation.stock} em estoque
      </span>
    </div>
  );
}

export default ProductVariationCard;
