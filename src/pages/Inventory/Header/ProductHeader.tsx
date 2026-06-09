import { ArrowLeft, Plus, Tag } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useProduct } from "../../../context/ProductContext";

function ProductHeader() {
  const { selectedProduct } = useProduct();
  const navigate = useNavigate();

  if (!selectedProduct) return null;

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
          onClick={() => navigate("/inventory/product/variation/new")}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 active:scale-95 transition-all shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Nova variação</span>
        </button>
      </div>

      <h1 className="text-xl font-semibold text-gray-800 text-center">
        {selectedProduct.name}
      </h1>

      <div className="text-sm text-gray-500 flex justify-between items-center">
        {selectedProduct.category ? (
          <div className="flex items-center gap-1 text-blue-600">
            <Tag className="w-3.5 h-3.5" />
            <span className="font-medium">{selectedProduct.category}</span>
          </div>
        ) : (
          <span className="text-gray-400 italic text-xs">Sem categoria</span>
        )}

        <div className="flex items-center gap-2">

          <span>
            CÓDIGO:{" "}
            <span className="font-medium text-gray-700">
              {String(selectedProduct.id).padStart(4, "0")}
            </span>
          </span>
        </div>
      </div>
    </header>
  );
}

export default ProductHeader;
