import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import OrderHeader from "../Header/OrderHeader";
import { useProduction } from "../../../context/ProductionContext";
import ProductionService from "../../../services/ProductionService";
import type { OrderItemView, ProductionDetailView } from "../../../types/ProductionType";

type ViewMode = "ready" | "pending";

function OrderProduction() {
  const [view, setView] = useState<ViewMode>("ready");
  const [data, setData] = useState<ProductionDetailView | null>(null);
  const [checkedIds, setCheckedIds] = useState<Set<number>>(new Set());
  const [saving, setSaving] = useState(false);

  const navigate = useNavigate();
  const { order } = useProduction();

  useEffect(() => {
    async function loadProductionData() {
      const orderId = order?.id;
      if (!orderId) return;
      const productionData = await ProductionService.searchProductionByOrderId(orderId);
      setData(productionData);
    }
    loadProductionData();
  }, []);

  function toggleCheck(orderItemId: number) {
    setCheckedIds(prev => {
      const next = new Set(prev);
      next.has(orderItemId) ? next.delete(orderItemId) : next.add(orderItemId);
      return next;
    });
  }

  async function handleSave() {
  if (checkedIds.size === 0 || !order?.id) return;
  setSaving(true);

  try {
    await ProductionService.fulfillItems(order.id, Array.from(checkedIds));

    const updated = await ProductionService.searchProductionByOrderId(order.id);

    if (updated.items.pending.length === 0) {
      navigate("/orders", {
        state: {
          selectedStatus: "confirmado",
          notification: {
            type: "success",
            message: "Pedido concluído com sucesso.",
          },
        },
      });
      return;
    }

    setData(updated);
    setCheckedIds(new Set());
  } finally {
    setSaving(false);
  }
}

  const baseClasses =
    "px-2 py-2 flex-1 text-center rounded-md border transition-all duration-200 font-medium text-sm sm:text-base";
  const activeClasses = "bg-blue-600 text-white border-blue-600 shadow-sm";
  const inactiveClasses = "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100";

  const progressPct = data?.progress.percentage ?? 0;

  return (
    <div className="w-full max-w-4xl mx-auto px-2 sm:px-4 py-4">
      <button
        onClick={() => navigate(-1)}
        className="mb-3 text-sm text-gray-500 hover:text-gray-700"
      >
        ← Back
      </button>

      <div className="bg-white border rounded-xl shadow-sm p-4 flex flex-col gap-4">

        {/* Header do pedido */}
        <OrderHeader title="Produção" />

        {data && (
          <div className="flex flex-col gap-1 text-sm text-gray-600">
            <span className="font-medium text-gray-700">
              Valor Total: R$ {Number(data.order.totalValue).toFixed(2)}
            </span>

            {/* Barra de progresso */}
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-gray-500">Progresso</span>
              <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500 rounded-full transition-all duration-500"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
              <span className="text-xs text-gray-500">
                {data.progress.fulfilled}/{data.progress.total}
              </span>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex justify-center items-center gap-2 w-full">
          <button
            onClick={() => setView("ready")}
            className={`${baseClasses} ${view === "ready" ? activeClasses : inactiveClasses}`}
          >
            Prontas
          </button>
          <button
            onClick={() => setView("pending")}
            className={`${baseClasses} ${view === "pending" ? activeClasses : inactiveClasses}`}
          >
            Pendentes
          </button>
        </div>

        {/* Tabela */}
        {data && (
          <>
            {view === "ready" && (
              <ReadyTable items={data.items.fulfilled} />
            )}
            {view === "pending" && (
              <PendingTable
                items={data.items.pending}
                checkedIds={checkedIds}
                onToggle={toggleCheck}
                onSave={handleSave}
                saving={saving}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}

// --- Sub-componentes de tabela ---

function ReadyTable({ items }: { items: OrderItemView[] }) {
  if (items.length === 0) {
    return (
      <p className="text-center text-sm text-gray-400 py-6">
        Nenhum item concluído ainda.
      </p>
    );
  }

  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="bg-blue-600 text-white">
          <th className="text-left px-3 py-2 rounded-tl-md">Produto</th>
          <th className="text-right px-3 py-2 rounded-tr-md">QTD</th>
        </tr>
      </thead>
      <tbody>
        {items.map(item => (
          <tr key={item.orderItemId} className="border-b last:border-0">
            <td className="px-3 py-2 text-gray-700">{item.variationSku}</td>
            <td className="px-3 py-2 text-right text-gray-700">{item.quantity}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function PendingTable({
  items,
  checkedIds,
  onToggle,
  onSave,
  saving,
}: {
  items: OrderItemView[];
  checkedIds: Set<number>;
  onToggle: (id: number) => void;
  onSave: () => void;
  saving: boolean;
}) {
  if (items.length === 0) {
    return (
      <p className="text-center text-sm text-gray-400 py-6">
        Todos os itens foram concluídos! 🎉
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-blue-600 text-white">
            <th className="text-left px-3 py-2 rounded-tl-md">Produto</th>
            <th className="text-right px-3 py-2">QTD</th>
            <th className="text-center px-3 py-2 rounded-tr-md">Check</th>
          </tr>
        </thead>
        <tbody>
          {items.map(item => (
            <tr key={item.orderItemId} className="border-b last:border-0">
              <td className="px-3 py-2 text-gray-700">{item.variationSku}</td>
              <td className="px-3 py-2 text-right text-gray-700">{item.quantity}</td>
              <td className="px-3 py-2 text-center">
                <input
                  type="checkbox"
                  checked={checkedIds.has(item.orderItemId)}
                  onChange={() => onToggle(item.orderItemId)}
                  className="w-4 h-4 accent-blue-600 cursor-pointer"
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <button
        onClick={onSave}
        disabled={checkedIds.size === 0 || saving}
        className="self-center px-8 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg
                   hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        {saving ? "Salvando..." : "Salvar"}
      </button>
    </div>
  );
}

export default OrderProduction;