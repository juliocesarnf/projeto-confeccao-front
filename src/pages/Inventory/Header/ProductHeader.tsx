import { ArrowLeft, Tag } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useProduct } from "../../../context/ProductContext";

function ProductHeader() {
  const { selectedProduct } = useProduct();
  const navigate = useNavigate();

  if (!selectedProduct) return null;

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
          {selectedProduct.name}
        </h1>
        <span
          className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${
            selectedProduct.active
              ? "bg-green-100 text-green-700"
              : "bg-gray-100 text-gray-500"
          }`}
        >
          {selectedProduct.active ? "Ativo" : "Inativo"}
        </span>
      </div>

      <div className="text-sm text-gray-500 flex justify-between items-center gap-4">
        {selectedProduct.category ? (
          <div className="flex items-center gap-1 text-blue-600">
            <Tag className="w-3.5 h-3.5" />
            <span className="font-medium">{selectedProduct.category}</span>
          </div>
        ) : (
          <span className="text-gray-400 italic text-xs">Sem categoria</span>
        )}

        <span>
          CÓDIGO:{" "}
          <span className="font-medium text-gray-700">
            {String(selectedProduct.id).padStart(4, "0")}
          </span>
        </span>
      </div>
    </header>
  );
}

export default ProductHeader;
