import { useMemo, useState } from "react";
import { ArrowLeft, Package2, Users2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useProduction } from "../../../context/ProductionContext";
import ProductionService from "../../../services/ProductionService";
import OrderHeader from "../Header/OrderHeader";
import { toast } from "react-toastify";

const CARD_COLORS = [
  { border: "border-l-blue-500",   badge: "bg-blue-50 text-blue-700",   dot: "bg-blue-500" },
  { border: "border-l-violet-500", badge: "bg-violet-50 text-violet-700", dot: "bg-violet-500" },
  { border: "border-l-emerald-500",badge: "bg-emerald-50 text-emerald-700", dot: "bg-emerald-500" },
  { border: "border-l-amber-500",  badge: "bg-amber-50 text-amber-700",  dot: "bg-amber-500" },
  { border: "border-l-rose-500",   badge: "bg-rose-50 text-rose-700",    dot: "bg-rose-500" },
  { border: "border-l-indigo-500", badge: "bg-indigo-50 text-indigo-700", dot: "bg-indigo-500" },
];

type ProductGroup = {
  productId: number;
  productName: string;
  totalQuantity: number;
  items: { id: number; size: string; color: string; quantity: number }[];
  processes: { processId: number; name: string; stepOrder: number; workerCount: number }[];
};

function OrderConfirm() {
  const navigate = useNavigate();
  const { order, orderItems, orderProducts, orderTeamAssignments } = useProduction();
  const [loading, setLoading] = useState(false);

  const groups = useMemo<ProductGroup[]>(() => {
    const map = new Map<number, ProductGroup>();

    for (const item of orderItems) {
      const qty = item.quantity - item.fulfilledQuantity;
      if (!map.has(item.product.id)) {
        map.set(item.product.id, {
          productId: item.product.id,
          productName: item.product.name,
          totalQuantity: 0,
          items: [],
          processes: [],
        });
      }
      const g = map.get(item.product.id)!;
      g.totalQuantity += qty;
      g.items.push({ id: item.id, size: item.variation.size, color: item.variation.color, quantity: qty });
    }

    for (const prod of orderProducts) {
      const g = map.get(prod.productId);
      if (!g) continue;
      g.processes = (prod.processes ?? [])
        .slice()
        .sort((a, b) => a.stepOrder - b.stepOrder)
        .map((p) => ({
          processId: p.processId,
          name: p.name,
          stepOrder: p.stepOrder,
          workerCount: orderTeamAssignments.filter(
            (a) => a.processId === p.processId && a.productId === prod.productId
          ).length,
        }));
    }

    return Array.from(map.values());
  }, [orderItems, orderProducts, orderTeamAssignments]);

  const totalPieces    = groups.reduce((s, g) => s + g.totalQuantity, 0);
  const totalWorkers   = new Set(orderTeamAssignments.map((a) => a.workerId)).size;

  if (!order) return <p className="p-4 text-gray-500">Pedido não encontrado</p>;

  async function handleConfirm() {
    if (!order) return;
    setLoading(true);
    try {
      const payload = ProductionService.buildPayload(order.id, orderItems, orderProducts, orderTeamAssignments);
      const response = await ProductionService.startProduction(payload);

      if (response.status < 200 || response.status >= 300) {
        toast.error(`Erro ${response.status}: ${response.message}`, { position: "top-right", autoClose: 5000 });
        return;
      }

      navigate("/orders", {
        state: {
          notification: { type: "success", message: response.message, status: response.status },
          selectedStatus: "producao",
        },
      });
    } catch (error: any) {
      if (!error.response) {
        toast.error("Servidor inacessível.", { position: "top-right", autoClose: 5000 });
        return;
      }
      const status = error.response.status;
      const msg = error.response.data?.message ?? "Erro inesperado ao iniciar produção.";
      toast.error(`Erro ${status}: ${msg}`, { position: "top-right", autoClose: 5000 });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full min-w-0 px-3 py-3 flex flex-col gap-4">
      <button onClick={() => navigate(-1)} className="self-start text-gray-500 hover:text-gray-700">
        <ArrowLeft size={20} />
      </button>

      {/* Header card */}
      <div className="bg-white border rounded-xl shadow-sm p-4 min-w-0">
        <OrderHeader title="Confirmar Produção" />
      </div>

      {/* Summary pills */}
      <div className="flex gap-2">
        <div className="flex-1 bg-blue-50 rounded-xl py-2.5 px-1 flex flex-col items-center gap-0.5">
          <span className="text-xl font-bold text-blue-700">{totalPieces}</span>
          <span className="text-[10px] text-blue-500 text-center leading-tight">peças</span>
        </div>
        <div className="flex-1 bg-violet-50 rounded-xl py-2.5 px-1 flex flex-col items-center gap-0.5">
          <span className="text-xl font-bold text-violet-700">{groups.length}</span>
          <span className="text-[10px] text-violet-500 text-center leading-tight">
            {groups.length === 1 ? "produto" : "produtos"}
          </span>
        </div>
        <div className="flex-1 bg-emerald-50 rounded-xl py-2.5 px-1 flex flex-col items-center gap-0.5">
          <span className="text-xl font-bold text-emerald-700">{totalWorkers}</span>
          <span className="text-[10px] text-emerald-500 text-center leading-tight">func.</span>
        </div>
      </div>

      {/* Product cards */}
      <div className="flex flex-col gap-3">
        {groups.map((group, idx) => {
          const c = CARD_COLORS[idx % CARD_COLORS.length];
          return (
            <div key={group.productId} className={`bg-white border border-l-4 ${c.border} rounded-xl overflow-hidden shadow-sm`}>

              {/* Product header */}
              <div className="px-4 py-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  <span className={`w-2 h-2 rounded-full shrink-0 ${c.dot}`} />
                  <span className="font-semibold text-gray-800 text-sm truncate">{group.productName}</span>
                </div>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full shrink-0 ${c.badge}`}>
                  {group.totalQuantity} pç
                </span>
              </div>

              {/* Variations */}
              <div className="px-4 pb-3 border-t border-gray-100">
                <p className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wide mt-3 mb-2">
                  <Package2 size={11} /> Variações
                </p>
                <div className="flex flex-wrap gap-2">
                  {group.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5"
                    >
                      <span className="text-xs text-gray-600">
                        {item.size}{item.size && item.color ? " • " : ""}{item.color}
                      </span>
                      <span className="text-xs font-bold text-blue-700">×{item.quantity}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Processes */}
              {group.processes.length > 0 && (
                <div className="px-4 pb-4 border-t border-gray-100">
                  <p className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wide mt-3 mb-3">
                    <Users2 size={11} /> Processos
                  </p>
                  <div className="flex flex-col gap-2">
                    {group.processes.map((proc, pIdx) => (
                      <div key={proc.processId} className="flex items-center gap-3">
                        {/* Step number with connector line */}
                        <div className="flex flex-col items-center shrink-0">
                          <span className="w-6 h-6 rounded-full bg-gray-100 text-gray-600 text-xs font-bold flex items-center justify-center">
                            {pIdx + 1}
                          </span>
                          {pIdx < group.processes.length - 1 && (
                            <span className="w-px h-3 bg-gray-200 mt-0.5" />
                          )}
                        </div>
                        <span className="text-sm text-gray-700 flex-1 leading-tight">{proc.name}</span>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${
                            proc.workerCount > 0 ? "bg-green-50 text-green-700" : "bg-red-50 text-red-500"
                          }`}
                        >
                          {proc.workerCount} func.
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Confirm button */}
      <button
        onClick={handleConfirm}
        disabled={loading}
        className="w-full py-3.5 rounded-xl bg-green-600 text-white font-semibold hover:bg-green-700 active:scale-95 transition-all disabled:bg-green-300 disabled:cursor-not-allowed text-sm"
      >
        {loading ? "Iniciando..." : "Iniciar Produção"}
      </button>
    </div>
  );
}

export default OrderConfirm;
