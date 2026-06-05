import { useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";
import { toast } from "react-toastify";
import ProductService from "../../../services/ProductService";

const CATEGORIES = [
  "Lingerie",
  "Conjunto",
  "Moda Praia",
  "Pijama",
  "Roupa Íntima Masculina",
  "Acessório",
];

function ProductNew(): ReactNode {
  const navigate = useNavigate();

  const [name, setName]               = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory]       = useState("");
  const [active, setActive]           = useState(true);
  const [saving, setSaving]           = useState(false);

  async function handleSave() {
    if (!name.trim()) {
      toast.error("O nome do produto é obrigatório.", { position: "top-right", autoClose: 4000 });
      return;
    }

    try {
      setSaving(true);
      await ProductService.createProduct({
        name: name.trim(),
        description: description.trim() || undefined,
        category: category || undefined,
        active,
      });

      navigate("/inventory", {
        state: {
          notification: { type: "success", message: "Produto criado com sucesso!" },
        },
      });
    } catch (error: any) {
      if (!error.response) {
        toast.error("Servidor inacessível.", { position: "top-right", autoClose: 5000 });
        return;
      }
      const status = error.response.status;
      const msg = error.response.data?.message ?? "Erro ao criar produto.";
      toast.error(`Erro ${status}: ${msg}`, { position: "top-right", autoClose: 5000 });
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
            onClick={() => navigate("/inventory")}
            className="p-1.5 rounded-md text-gray-500 hover:bg-gray-100 transition-colors shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1 text-center">
            <h1 className="text-xl font-semibold">Novo Produto</h1>
          </div>
          <div className="w-8 shrink-0" />
        </div>
      </header>

      {/* Formulário */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">
            Nome <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">Categoria</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white text-gray-800"
          >
            <option value="">Sem categoria</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">Descrição</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white resize-none"
          />
        </div>

        <div className="flex items-center justify-between py-2">
          <span className="text-sm font-medium text-gray-700">Ativo</span>
          <button
            onClick={() => setActive((v) => !v)}
            className={`w-12 h-6 rounded-full transition-colors ${active ? "bg-green-500" : "bg-gray-300"}`}
          >
            <span
              className={`block w-5 h-5 bg-white rounded-full shadow transition-transform mx-0.5 ${active ? "translate-x-6" : "translate-x-0"}`}
            />
          </button>
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

export default ProductNew;
