import { ArrowLeft, Layers } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useMaterial } from "../../../context/MaterialContext";

function MaterialHeader() {
  const { selectedMaterial } = useMaterial();
  const navigate = useNavigate();

  if (!selectedMaterial) return null;

  return (
    <header className="flex flex-col gap-3 border-b pb-3">
      <div className="flex items-start gap-2">
        <button
          onClick={() => navigate("/inventory")}
          className="p-1.5 rounded-md text-gray-500 hover:bg-gray-100 transition-colors shrink-0"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-semibold flex-1 text-center">
          {selectedMaterial.name}
        </h1>
        <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 font-medium shrink-0">
          {selectedMaterial.baseUnit}
        </span>
      </div>

      <div className="text-sm text-gray-500 flex justify-between items-center gap-4">
        <span>
          ID:{" "}
          <span className="font-medium text-gray-700">
            {String(selectedMaterial.id).padStart(4, "0")}
          </span>
        </span>

        {selectedMaterial.quantityPerPackage != null && (
          <div className="flex items-center gap-1">
            <Layers className="w-3.5 h-3.5" />
            <span className="font-medium text-gray-700">
              {selectedMaterial.quantityPerPackage === 1
                ? "Vendido individualmente"
                : `${selectedMaterial.quantityPerPackage} por embalagem`}
            </span>
          </div>
        )}
      </div>
    </header>
  );
}

export default MaterialHeader;
