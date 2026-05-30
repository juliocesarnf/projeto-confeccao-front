import { useEffect, useState } from "react";
import { ArrowLeft, Check, ChevronDown, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import OrderHeader from "../Header/OrderHeader";
import { useProduction } from "../../../context/ProductionContext";
import ProductionService from "../../../services/ProductionService";
import type { BatchView, OrderItemView, ProductionDetailView } from "../../../types/ProductionType";

type ViewMode = "ready" | "pending";

function OrderProduction() {
  const [view, setView] = useState<ViewMode>("ready");
  const [data, setData] = useState<ProductionDetailView | null>(null);
  const [checkedIds, setCheckedIds] = useState<Set<number>>(new Set());
  const [saving, setSaving] = useState(false);

  const navigate = useNavigate();
  const { order } = useProduction();

  async function loadProductionData() {
    const orderId = order?.id;
    if (!orderId) return;
    const productionData = await ProductionService.searchProductionByOrderId(orderId);
    setData(productionData);
  }

  useEffect(() => {
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
            notification: { type: "success", message: "Pedido concluído com sucesso." },
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
      <button onClick={() => navigate(-1)} className="mb-3 text-sm text-gray-500 hover:text-gray-700">
        <ArrowLeft size={20} />
      </button>

      <div className="bg-white border rounded-xl shadow-sm p-4 flex flex-col gap-4">
        <OrderHeader title="Produção" />

        {data && (
          <div className="flex flex-col gap-1 text-sm text-gray-600">
            <span className="font-medium text-gray-700">
              Valor Total: R$ {Number(data.order.totalValue).toFixed(2)}
            </span>
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

        {data && (
          <>
            {view === "ready" && (
              <ReadyTable items={data.items.fulfilled} onRefresh={loadProductionData} />
            )}
            {view === "pending" && (
              <PendingTable
                items={data.items.pending}
                checkedIds={checkedIds}
                onToggle={toggleCheck}
                onSave={handleSave}
                saving={saving}
                onRefresh={loadProductionData}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}


// --- Stepper de processos ---

function BatchStepper({ batches, onRefresh }: { batches: BatchView[]; onRefresh: () => void }) {
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  if (batches.length === 0) {
    return <p className="text-xs text-gray-400 py-3 text-center">Nenhum processo registrado.</p>;
  }

  const sorted = [...batches].sort((a, b) => a.stepOrder - b.stepOrder);

  async function handleChange(batchId: number, completed: boolean) {
    setUpdatingId(batchId);
    try {
      await ProductionService.updateBatchStatus(batchId, completed);
      onRefresh();
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <div className="bg-gray-50 px-4 py-3 overflow-hidden">
      {sorted.map((batch, index) => {
        const isLast = index === sorted.length - 1;
        const isUpdating = updatingId === batch.batchId;

        const dotClass = batch.completed
          ? "bg-green-500 text-white"
          : "bg-gray-200 text-gray-400";

        const lineClass = batch.completed ? "bg-green-300" : "bg-gray-200";

        return (
          <div key={batch.batchId} className="flex gap-3">
            {/* Indicador vertical */}
            <div className="flex flex-col items-center shrink-0">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${dotClass}`}>
                {batch.completed ? <Check size={13} /> : batch.stepOrder}
              </div>
              {!isLast && (
                <div className={`w-0.5 flex-1 min-h-[16px] mt-0.5 ${lineClass}`} />
              )}
            </div>

            {/* Conteúdo */}
            <div className={`flex-1 min-w-0 ${isLast ? "pb-1" : "pb-4"}`}>
              <div className="flex items-center justify-between gap-2">
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-medium text-gray-700 truncate">
                    {batch.processName}
                  </span>
                  {batch.workers.length > 0 && (
                    <span className="text-xs text-gray-400 truncate">
                      {batch.workers.map(w => w.workerName).join(", ")}
                    </span>
                  )}
                </div>

                {!batch.completed && (
                  <button
                    disabled={isUpdating}
                    onClick={() => handleChange(batch.batchId, true)}
                    className="shrink-0 text-xs px-3 py-1.5 rounded-lg bg-green-600 text-white font-medium
                               disabled:opacity-50 active:bg-green-700 transition-colors"
                  >
                    {isUpdating ? "..." : "Concluir"}
                  </button>
                )}
                {batch.completed && (
                  <span className="shrink-0 text-xs px-2 py-0.5 rounded-full font-medium bg-green-100 text-green-700">
                    Concluído
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// --- ItemRow com acordeão ---

function ItemRow({
  item,
  expanded,
  onToggle,
  onRefresh,
  extra,
}: {
  item: OrderItemView;
  expanded: boolean;
  onToggle: () => void;
  onRefresh: () => void;
  extra?: React.ReactNode;
}) {
  return (
    <>
      <tr
        className="border-b cursor-pointer hover:bg-blue-50 transition-colors"
        onClick={onToggle}
      >
        <td className="px-3 py-2 text-gray-700">
          <div className="flex items-center gap-1">
            {expanded
              ? <ChevronDown size={14} className="text-blue-500 shrink-0" />
              : <ChevronRight size={14} className="text-gray-400 shrink-0" />
            }
            <span className="truncate">{item.variationSku}</span>
          </div>
        </td>
        <td className="px-3 py-2 text-right text-gray-700 whitespace-nowrap">
          {item.fulfilledQuantity}/{item.quantity}
        </td>
        {extra}
      </tr>
      {expanded && (
        <tr>
          <td colSpan={extra ? 3 : 2} className="p-0">
            <BatchStepper batches={item.batches} onRefresh={onRefresh} />
          </td>
        </tr>
      )}
    </>
  );
}

// --- Tabela de prontas ---

function ReadyTable({ items, onRefresh }: { items: OrderItemView[]; onRefresh: () => void }) {
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());

  function toggle(id: number) {
    setExpandedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  if (items.length === 0) {
    return (
      <p className="text-center text-sm text-gray-400 py-6">Nenhum item concluído ainda.</p>
    );
  }

  return (
    <table className="w-full text-sm table-fixed">
      <thead>
        <tr className="bg-blue-600 text-white">
          <th className="text-left px-3 py-2 rounded-tl-md">Produto</th>
          <th className="text-right px-3 py-2 rounded-tr-md w-16">QTD</th>
        </tr>
      </thead>
      <tbody>
        {items.map(item => (
          <ItemRow
            key={item.orderItemId}
            item={item}
            expanded={expandedIds.has(item.orderItemId)}
            onToggle={() => toggle(item.orderItemId)}
            onRefresh={onRefresh}
          />
        ))}
      </tbody>
    </table>
  );
}

// --- Tabela de pendentes ---

function PendingTable({
  items,
  checkedIds,
  onToggle,
  onSave,
  saving,
  onRefresh,
}: {
  items: OrderItemView[];
  checkedIds: Set<number>;
  onToggle: (id: number) => void;
  onSave: () => void;
  saving: boolean;
  onRefresh: () => void;
}) {
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());

  function toggleExpand(id: number) {
    setExpandedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  if (items.length === 0) {
    return (
      <p className="text-center text-sm text-gray-400 py-6">Todos os itens foram concluídos! 🎉</p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <table className="w-full text-sm table-fixed">
        <thead>
          <tr className="bg-blue-600 text-white">
            <th className="text-left px-3 py-2 rounded-tl-md">Produto</th>
            <th className="text-right px-3 py-2 w-16">QTD</th>
            <th className="text-center px-3 py-2 rounded-tr-md w-14">Check</th>
          </tr>
        </thead>
        <tbody>
          {items.map(item => (
            <ItemRow
              key={item.orderItemId}
              item={item}
              expanded={expandedIds.has(item.orderItemId)}
              onToggle={() => toggleExpand(item.orderItemId)}
              onRefresh={onRefresh}
              extra={
                <td className="px-3 py-2 text-center" onClick={e => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={checkedIds.has(item.orderItemId)}
                    onChange={() => onToggle(item.orderItemId)}
                    className="w-4 h-4 accent-blue-600 cursor-pointer"
                  />
                </td>
              }
            />
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
