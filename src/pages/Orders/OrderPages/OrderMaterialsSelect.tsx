import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useProduction } from "../../../context/ProductionContext";
import MaterialsService from "../../../services/MaterialsService";

function OrderSelectMaterials() {
  const navigate = useNavigate();
  const { order, orderMaterialsSelect } = useProduction();
  const [creatingKit, setCreatingKit] = useState(false);
  const [kitMessage, setKitMessage] = useState<string | null>(null);

  const dueDate = order ? new Date(order.dueDate) : null;
  const today = new Date();
  const diffDays = order && dueDate
    ? Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  const statusColor = order
    ? diffDays <= 1
      ? "text-red-600"
      : diffDays <= 3
      ? "text-yellow-600"
      : "text-blue-600"
    : "text-gray-600";

  async function handleCreateKit() {
    if (orderMaterialsSelect.length === 0) {
      setKitMessage("Nenhum material para criar kit.");
      return;
    }

    setCreatingKit(true);
    setKitMessage(null);

    try {
      await MaterialsService.createKit(orderMaterialsSelect);
      setKitMessage("Kit criado com sucesso.");
      if (order?.id) {
        navigate(`/orders/${order.id}/team`);
      }
    } catch (error) {
      console.error(error);
      setKitMessage("Erro ao criar kit. Tente novamente.");
    } finally {
      setCreatingKit(false);
    }
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-2 sm:px-4 py-4">
      
      {/* BACK */}
      <button
        onClick={() => navigate(-1)}
        className="mb-3 text-sm text-gray-500 hover:text-gray-700"
      >
        ← Back
      </button>

      <div className="bg-white border rounded-xl shadow-sm p-4 flex flex-col gap-4">
        <header className="flex flex-col gap-3 border-b pb-3">
          <div>
            <h1 className="text-xl font-semibold">Pedido #{order?.id ?? "—"}</h1>
            <p className="text-sm text-gray-500 mt-1">Selecionar Materiais</p>
          </div>

          <div className="text-sm text-gray-500 flex flex-wrap gap-4">
            <span>
              Due date: <span className={`font-medium ${statusColor}`}>
                {dueDate ? dueDate.toLocaleDateString("en-US") : "—"}
              </span>
            </span>
            <span>
              Total: <span className="font-medium text-gray-800">
                $ {order ? Number(order.totalValue || 0).toFixed(2) : "0.00"}
              </span>
            </span>
            <span>
              Quantidade total: <span className="font-medium text-gray-800">
                {order?.totalQuantity ?? "—"}
              </span>
            </span>
          </div>
        </header>

        <div className="overflow-hidden rounded-xl bg-white">
          <div className="grid grid-cols-12 px-4 py-3 text-sm font-semibold text-gray-600">
            <div className="col-span-9">Material</div>
            <div className="col-span-3 text-right">Quantidade</div>
          </div>

          <div>
            {orderMaterialsSelect.length > 0 ? (
              orderMaterialsSelect.map((item) => (
                <div
                  key={`${item.variationId}-${item.material}`}
                  className="grid grid-cols-12 px-4 py-3 items-center border-t"
                >
                  <div className="col-span-9 flex flex-col">
                    <span className="font-medium">{item.material}</span>
                    <span className="text-xs text-gray-500">
                      {item.variation} • {item.base_unit}
                    </span>
                  </div>
                  <div className="col-span-3 text-right">
                    <span className="px-3 py-1 rounded-md text-sm font-medium bg-blue-50 text-blue-700">
                      {item.quantity}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-sm text-gray-500">
                Nenhum material selecionado.
              </div>
            )}
          </div>
        </div>

        <div className="pt-2">
          <button
            onClick={handleCreateKit}
            disabled={creatingKit}
            className="mt-4 w-full py-3 rounded-md bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition disabled:cursor-not-allowed disabled:bg-indigo-300"
          >
            {creatingKit ? "Criando Kit..." : "Criar Kit"}
          </button>
          {kitMessage && (
            <p className="mt-3 text-sm text-gray-600">{kitMessage}</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default OrderSelectMaterials;
