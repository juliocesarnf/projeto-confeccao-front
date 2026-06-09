import { ArrowLeft, Layers, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useMaterial } from "../../../context/MaterialContext";

function MaterialHeader() {
  const { selectedMaterial } = useMaterial();
  const navigate = useNavigate();

  if (!selectedMaterial) return null;

  return (
    <header className="flex flex-col gap-2 border-b pb-3">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate("/inventory")}
          className="p-1.5 rounded-md text-gray-500 hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <button
          onClick={() => navigate("/inventory/material/variation/new")}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 active:scale-95 transition-all shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Nova variação</span>
        </button>
      </div>

      <h1 className="text-xl font-semibold text-gray-800 text-center">
        {selectedMaterial.name}
      </h1>

      <div className="text-sm text-gray-500 flex justify-between items-center">
        <span>
          ID:{" "}
          <span className="font-medium text-gray-700">
            {String(selectedMaterial.id).padStart(4, "0")}
          </span>
        </span>

        {selectedMaterial.quantityPerPackage != null && (
          <div className="flex items-center gap-1 text-gray-700">
            <Layers className="w-3.5 h-3.5" />
            <span className="font-medium">{selectedMaterial.quantityPerPackage}</span>
          </div>
        )}
      </div>
    </header>
  );
}

export default MaterialHeader;
