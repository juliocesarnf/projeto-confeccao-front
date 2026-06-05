import { useNavigate } from "react-router-dom";
import { useMaterial } from "../../../context/MaterialContext";
import type { MaterialVariation } from "../../../types/MaterialType";

type Props = {
  variation: MaterialVariation;
  baseUnit: string;
};

function MaterialVariationCard({ variation, baseUnit }: Props) {
  const { setSelectedVariation } = useMaterial();
  const navigate = useNavigate();

  function handleClick() {
    setSelectedVariation(variation);
    navigate("/inventory/material/update");
  }

  return (
    <div
      onClick={handleClick}
      className="border border-gray-200 rounded-md bg-white px-4 py-3 flex flex-col gap-1 cursor-pointer hover:border-indigo-300 hover:shadow-sm transition-all"
    >
      <span className="text-base font-semibold text-gray-800">{variation.variation}</span>
      <span className={`text-xs font-medium ${variation.stock > 0 ? "text-green-600" : "text-red-500"}`}>
        {variation.stock} {baseUnit} em estoque
      </span>
    </div>
  );
}

export default MaterialVariationCard;
