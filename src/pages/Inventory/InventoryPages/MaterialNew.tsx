import { useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";
import { toast } from "react-toastify";
import MaterialsService from "../../../services/MaterialService";

function MaterialNew(): ReactNode {
  const navigate = useNavigate();

  const [name, setName]                             = useState("");
  const [baseUnit, setBaseUnit]                     = useState("");
  const [quantityPerPackage, setQuantityPerPackage] = useState<string>("");
  const [saving, setSaving]                         = useState(false);

  async function handleSave() {
    if (!name.trim()) {
      toast.error("O nome do material é obrigatório.", { position: "top-right", autoClose: 4000 });
      return;
    }
    if (!baseUnit.trim()) {
      toast.error("A unidade base é obrigatória.", { position: "top-right", autoClose: 4000 });
      return;
    }

    try {
      setSaving(true);
      await MaterialsService.createMaterial({
        name: name.trim(),
        baseUnit: baseUnit.trim(),
        quantityPerPackage: quantityPerPackage !== "" ? Number(quantityPerPackage) : undefined,
      });

      navigate("/inventory", {
        state: {
          notification: { type: "success", message: "Material criado com sucesso!" },
        },
      });
    } catch (error: any) {
      if (!error.response) {
        toast.error("Servidor inacessível.", { position: "top-right", autoClose: 5000 });
        return;
      }
      const status = error.response.status;
      const msg = error.response.data?.message ?? "Erro ao criar material.";
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
            <h1 className="text-xl font-semibold">Novo Material</h1>
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
            className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">
            Unidade base <span className="text-red-500">*</span>
          </label>
          <select
            value={baseUnit}
            onChange={(e) => setBaseUnit(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white text-gray-800"
          >
            <option value="">Selecione...</option>
            <option value="UN">UN — Unidade</option>
            <option value="M">M — Metro</option>
            <option value="KG">KG — Quilograma</option>
            <option value="PAR">PAR — Par</option>
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">Quantidade por embalagem</label>
          <input
            type="number"
            min={1}
            value={quantityPerPackage}
            onChange={(e) => setQuantityPerPackage(e.target.value)}
            placeholder="Deixe vazio se não aplicável"
            className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white"
          />
        </div>
      </div>

      {/* Botão salvar */}
      <button
        onClick={handleSave}
        disabled={saving}
        className="flex items-center justify-center gap-2 w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-medium rounded-md transition-colors text-sm"
      >
        <Save className="w-4 h-4" />
        {saving ? "Salvando..." : "Salvar"}
      </button>

    </div>
  );
}

export default MaterialNew;
