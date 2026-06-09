import { useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";
import { toast } from "react-toastify";
import { useProduct } from "../../../context/ProductContext";
import ProductService from "../../../services/ProductService";

function ProductVariationNew(): ReactNode {
  const { selectedProduct } = useProduct();
  const navigate = useNavigate();
  const [color, setColor] = useState("");
  const [size, setSize] = useState("");
  const [stock, setStock] = useState<string>("");
  const [saving, setSaving] = useState(false);

  if (!selectedProduct) {
    navigate("/inventory");
    return null;
  }

  async function handleSave() {
    if (!color.trim() && !size.trim()) {
      toast.error("Informe ao menos a cor ou o tamanho.", { position: "top-right", autoClose: 4000 });
      return;
    }

    try {
      setSaving(true);
      if (!selectedProduct) return;
      await ProductService.createVariation(selectedProduct.id, {
        color: color.trim() || null,
        size: size.trim() || null,
        stock: stock !== "" ? Number(stock) : 0,
      });
      navigate("/inventory/product");
      toast.success("Variação criada com sucesso!", { position: "top-right", autoClose: 3000 });
    } catch (error: any) {
      const status = error.response?.status;
      if (status && status < 500 && ![401, 403, 404].includes(status)) {
        const msg = error.response?.data?.message ?? "Erro ao criar variação.";
        toast.error(msg, { position: "top-right", autoClose: 5000 });
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="w-full max-w-6xl flex flex-col gap-4 px-0 sm:px-4">

      <header className="flex flex-col gap-3 border-b pb-3">
        <div className="flex items-start gap-2">
          <button
            onClick={() => navigate("/inventory/product")}
            className="p-1.5 rounded-md text-gray-500 hover:bg-gray-100 transition-colors shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1 text-center">
            <h1 className="text-xl font-semibold">Nova Variação</h1>
          </div>
          <div className="w-8 shrink-0" />
        </div>

        <p className="text-sm text-gray-500 font-medium">{selectedProduct.name}</p>
      </header>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">Cor</label>
          <input
            type="text"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            placeholder="Ex: Azul"
            className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">Tamanho</label>
          <input
            type="text"
            value={size}
            onChange={(e) => setSize(e.target.value)}
            placeholder="Ex: G"
            className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">Estoque inicial</label>
          <input
            type="number"
            min={0}
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            placeholder="0"
            className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white"
          />
        </div>
      </div>

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

export default ProductVariationNew;
