import { Layers } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useMaterial } from "../../../context/MaterialContext";
import type { Material } from "../../../types/MaterialType";

type Props = {
  material: Material;
};

function MaterialCard({ material }: Props) {
  const { setSelectedMaterial } = useMaterial();
  const navigate = useNavigate();

  function handleClick() {
    setSelectedMaterial(material);
    navigate("/inventory/material");
  }

  return (
    <div
      onClick={handleClick}
      className="border border-gray-200 rounded-md bg-white px-4 py-3 flex flex-col gap-2 cursor-pointer hover:border-indigo-300 hover:shadow-sm transition-all"
    >
      <div className="flex items-start justify-between gap-2">
        <p className="font-semibold text-gray-800 leading-tight">{material.name}</p>
        <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 font-medium shrink-0">
          {material.baseUnit}
        </span>
      </div>

      {material.quantityPerPackage != null && (
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <Layers className="w-3 h-3" />
          <span>
            {material.quantityPerPackage === 1
              ? "VENDIDO INDIVIDUALMENTE"
              : `${material.quantityPerPackage} ${{ PAR: "PARES", M: "METROS", KG: "QUILOS", U: "UNIDADES" }[material.baseUnit] ?? material.baseUnit} POR EMBALAGEM`}
          </span>
        </div>
      )}
    </div>
  );
}

export default MaterialCard;
