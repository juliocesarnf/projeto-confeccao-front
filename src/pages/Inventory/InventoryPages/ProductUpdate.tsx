import { useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";
import { toast } from "react-toastify";
import { useProduct } from "../../../context/ProductContext";
import ProductService from "../../../services/ProductService";

function ProductUpdate(): ReactNode {
  const { selectedProduct, selectedVariation, setSelectedVariation } = useProduct();
  const navigate = useNavigate();

  const [size, setSize] = useState(selectedVariation?.size ?? "");
  const [color, setColor] = useState(selectedVariation?.color ?? "");
  const [stock, setStock] = useState(selectedVariation?.stock ?? 0);
  const [saving, setSaving] = useState(false);

  if (!selectedProduct || !selectedVariation) {
    navigate("/inventory");
    return null;
  }

  async function handleSave() {
    if (!selectedVariation) return;
    try {
      setSaving(true);
      const updated = await ProductService.updateVariation(selectedVariation.id, {
        size: size || null,
        color: color || null,
        stock,
      });
      setSelectedVariation(updated);
      navigate("/inventory/product");
      toast.success("Variação atualizada com sucesso!", { position: "top-right", autoClose: 3000 });
    } catch (error: any) {
      const status = error.response?.status;
      if (status && status < 500 && ![401, 403, 404].includes(status)) {
        const msg = error.response?.data?.message ?? "Erro ao atualizar variação.";
        toast.error(msg, { position: "top-right", autoClose: 5000 });
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="w-full max-w-6xl flex flex-col gap-4 px-0 sm:px-4">

      {/* Header */}
      <header className="flex flex-col gap-3 border-b pb-3">
        <div className="flex items-start gap-2">
          <button
            onClick={() => navigate("/inventory/product")}
            className="p-1.5 rounded-md text-gray-500 hover:bg-gray-100 transition-colors shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1 text-center">
            <h1 className="text-xl font-semibold">Editar Variação</h1>
          </div>
          <div className="w-8 shrink-0" />
        </div>

        <div className="text-sm text-gray-500 flex justify-between">
          <span className="font-medium text-gray-700">{selectedProduct.name}</span>
          <span>
            CÓDIGO:{" "}
            <span className="font-medium text-gray-700">
              {String(selectedVariation.id).padStart(4, "0")}
            </span>
          </span>
        </div>
      </header>

      {/* Formulário */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">Tamanho</label>
          <input
            type="text"
            value={size}
            onChange={(e) => setSize(e.target.value)}
            placeholder="Ex: P, M, G, GG..."
            className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">Cor</label>
          <input
            type="text"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            placeholder="Ex: Vermelho, Azul..."
            className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">Estoque</label>
          <input
            type="number"
            min={0}
            value={stock}
            onChange={(e) => setStock(Number(e.target.value))}
            className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white"
          />
        </div>
      </div>

      {/* Botão salvar */}
      <button
        onClick={handleSave}
        disabled={saving}
        className="flex items-center justify-center gap-2 w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-medium rounded-md transition-colors text-sm"
      >
        <Save className="w-4 h-4" />
        {saving ? "Salvando..." : "Salvar"}
      </button>

    </div>
  );
}

export default ProductUpdate;
