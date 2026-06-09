import { Minus, Pencil, Plus, Save, X } from "lucide-react";
import { useState } from "react";
import { toast } from "react-toastify";
import MaterialsService from "../../../services/MaterialService";
import type { MaterialVariation } from "../../../types/MaterialType";

type Props = {
  variation: MaterialVariation;
  baseUnit: string;
};

function MaterialVariationCard({ variation, baseUnit }: Props) {
  const [stock, setStock] = useState(variation.stock);
  const [loading, setLoading] = useState<"inc" | "dec" | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [editName, setEditName] = useState(variation.variation);
  const [editStock, setEditStock] = useState(variation.stock);
  const [saving, setSaving] = useState(false);

  function openEdit() {
    setEditName(variation.variation);
    setEditStock(stock);
    setEditOpen(true);
  }

  async function handleSave() {
    setSaving(true);
    try {
      const updated = await MaterialsService.updateVariation(variation.id, {
        variation: editName,
        stock: editStock,
      });
      setStock(updated.stock);
      setEditOpen(false);
      toast.success("Variação atualizada!", { position: "bottom-center", autoClose: 2500 });
    } catch (error: any) {
      const status = error.response?.status;
      if (status && status < 500 && ![401, 403, 404].includes(status)) {
        const msg = error.response?.data?.message ?? "Erro ao atualizar variação.";
        toast.error(msg, { position: "bottom-center", autoClose: 4000 });
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleIncrement(e: React.MouseEvent) {
    e.stopPropagation();
    if (loading) return;
    setLoading("inc");
    try {
      const updated = await MaterialsService.addStockPack(variation.id);
      setStock(updated.stock);
      toast.success(`Estoque: ${updated.stock} ${baseUnit}`, { position: "bottom-center", autoClose: 2500 });
    } catch (error: any) {
      const status = error.response?.status;
      if (status && status < 500 && ![401, 403, 404].includes(status)) {
        const msg = error.response?.data?.message ?? "Não foi possível adicionar ao estoque.";
        toast.error(msg, { position: "bottom-center", autoClose: 4000 });
      }
    } finally {
      setLoading(null);
    }
  }

  async function handleDecrement(e: React.MouseEvent) {
    e.stopPropagation();
    if (loading || stock <= 0) return;
    setLoading("dec");
    try {
      const updated = await MaterialsService.removeStockPack(variation.id);
      setStock(updated.stock);
      toast.success(`Estoque: ${updated.stock} ${baseUnit}`, { position: "bottom-center", autoClose: 2500 });
    } catch (error: any) {
      const status = error.response?.status;
      if (status && status < 500 && ![401, 403, 404].includes(status)) {
        const msg = error.response?.data?.message ?? "Não foi possível remover do estoque.";
        toast.error(msg, { position: "bottom-center", autoClose: 4000 });
      }
    } finally {
      setLoading(null);
    }
  }

  return (
    <>
      {/* ── Card ── */}
      <div className="rounded-2xl bg-white border border-gray-200 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all overflow-hidden">

        {/* Zona clicável — info + edição */}
        <div
          role="button"
          tabIndex={0}
          onClick={openEdit}
          onKeyDown={(e) => e.key === "Enter" && openEdit()}
          className="px-4 pt-4 pb-3 cursor-pointer select-none group active:bg-indigo-50/60 transition-colors"
        >
          <div className="flex items-start justify-between gap-2">
            <span className="text-sm font-semibold text-gray-800 leading-snug flex-1 truncate">
              {variation.variation}
            </span>
            <Pencil className="w-3.5 h-3.5 mt-0.5 shrink-0 text-gray-300 group-hover:text-indigo-400 transition-colors" />
          </div>

          <div className={`mt-2.5 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
            stock > 0 ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${stock > 0 ? "bg-green-500" : "bg-red-400"}`} />
            {stock} {baseUnit}
          </div>
        </div>

        {/* Divisor */}
        <div className="h-px bg-gray-100" />

        {/* Zona de pacote — botões +/- */}
        <div className="px-4 py-2.5 flex items-center justify-between">
          <span className="text-xs text-gray-400 font-medium tracking-wide">Pacote</span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDecrement}
              disabled={loading !== null || stock <= 0}
              className="w-8 h-8 rounded-full flex items-center justify-center border border-gray-200 bg-gray-50 text-gray-500 hover:bg-gray-100 hover:border-gray-300 active:scale-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              aria-label="Remover pacote"
            >
              {loading === "dec" ? (
                <span className="w-3 h-3 rounded-full border-2 border-gray-400 border-t-transparent animate-spin" />
              ) : (
                <Minus className="w-3.5 h-3.5" />
              )}
            </button>

            <button
              onClick={handleIncrement}
              disabled={loading !== null}
              className="w-8 h-8 rounded-full flex items-center justify-center bg-indigo-600 text-white hover:bg-indigo-700 active:scale-90 active:bg-indigo-800 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
              aria-label="Adicionar pacote"
            >
              {loading === "inc" ? (
                <span className="w-3 h-3 rounded-full border-2 border-white border-t-transparent animate-spin" />
              ) : (
                <Plus className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ── Bottom sheet de edição ── */}
      {editOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px]"
            onClick={() => setEditOpen(false)}
          />

          {/* Sheet */}
          <div className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl shadow-2xl px-5 pt-3 pb-10 animate-slide-up">
            {/* Handle */}
            <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-5" />

            {/* Cabeçalho */}
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-base font-semibold text-gray-900">Editar Variação</h2>
                <p className="text-xs text-gray-400 mt-0.5">ID #{String(variation.id).padStart(4, "0")}</p>
              </div>
              <button
                onClick={() => setEditOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Campos */}
            <div className="flex flex-col gap-4 mb-6">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Variação
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  autoFocus
                  className="w-full px-3.5 py-3 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300 transition"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Estoque ({baseUnit})
                </label>
                <input
                  type="number"
                  min={0}
                  value={editStock}
                  onChange={(e) => setEditStock(Number(e.target.value))}
                  className="w-full px-3.5 py-3 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300 transition"
                />
              </div>
            </div>

            {/* Botão salvar */}
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center justify-center gap-2 w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-60 text-white font-semibold rounded-2xl transition-colors text-sm shadow-md shadow-indigo-200"
            >
              <Save className="w-4 h-4" />
              {saving ? "Salvando..." : "Salvar Alterações"}
            </button>
          </div>
        </>
      )}
    </>
  );
}

export default MaterialVariationCard;
