import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useProduction } from "../../../context/ProductionContext";
import ProductionService from "../../../services/ProductionService";
import OrderHeader from "../Header/OrderHeader";
import { toast } from "react-toastify";

function OrderConfirm() {
  const navigate = useNavigate();
  const {
    order,
    orderItems,
    orderProducts,
    orderTeamAssignments,
  } = useProduction();

  const [loading, setLoading] = useState(false);

  if (!order) return <p className="p-4 text-gray-500">Pedido não encontrado</p>;

  async function handleConfirm() {
    if (!order) return;

    setLoading(true);

    try {
      const payload = ProductionService.buildPayload(
        order.id,
        orderItems,
        orderProducts,
        orderTeamAssignments
      );

      const response = await ProductionService.startProduction(payload);

      if (response.status < 200 || response.status >= 300) {
        console.error(`[${response.status}] Erro ao iniciar produção:`, response.message);
        toast.error(`Erro ${response.status}: ${response.message}`, {
          position: "top-right",
          autoClose: 5000,
        });
        return;
      }

      navigate("/orders", {
        state: {
          notification: {
            type: "success",
            message: response.message,
            status: response.status,
          },
          selectedStatus: "producao",
        },
      });

    } catch (error: any) {
      if (!error.response) {
        console.error("Servidor inacessível: ", error.message);
        toast.error("Servidor inacessível.", {
          position: "top-right",
          autoClose: 5000,
        });
        return;
      }

      const status = error.response.status;
      const msg = error.response.data?.message ?? "Erro inesperado ao iniciar produção.";

      console.error(`[${status}] ${msg}`, error);
      toast.error(`Erro ${status}: ${msg}`, {
        position: "top-right",
        autoClose: 5000,
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-1 sm:px-4 py-1">
      <button
        onClick={() => navigate(-1)}
        className="mb-3 text-sm text-gray-500 hover:text-gray-700"
      >
        ← Back
      </button>

      <div className="bg-white border rounded-xl shadow-sm p-4 flex flex-col gap-6">
        <OrderHeader title="Confirmar Produção" />

        {/* RESUMO ITENS */}
        <section className="flex flex-col gap-2">
          <h3 className="text-sm font-semibold text-gray-700">Peças</h3>
          <div className="rounded-lg border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">Produto</th>
                  <th className="px-4 py-3 text-left font-medium">Variação</th>
                  <th className="px-4 py-3 text-right font-medium">Qtd</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orderItems.map((item) => (
                  <tr key={item.id} className="bg-white">
                    <td className="px-4 py-3 text-gray-700">{item.product.name}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {item.variation.size} • {item.variation.color}
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-blue-700">
                      x{item.quantity - item.fulfilledQuantity}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* RESUMO EQUIPE */}
        <section className="flex flex-col gap-2">
          <h3 className="text-sm font-semibold text-gray-700">Equipe por Processo</h3>
          <div className="rounded-lg border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">Produto</th>
                  <th className="px-4 py-3 text-left font-medium">Processo</th>
                  <th className="px-4 py-3 text-right font-medium">Responsáveis</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orderProducts.map((product) =>
                  (product.processes ?? []).map((process) => {
                    const workerCount = orderTeamAssignments.filter(
                      (a) =>
                        a.processId === process.processId &&
                        a.productId === product.productId
                    ).length;

                    return (
                      <tr key={`${product.productId}-${process.processId}`} className="bg-white">
                        <td className="px-4 py-3 text-gray-700">{product.name}</td>
                        <td className="px-4 py-3 text-gray-500">{process.name}</td>
                        <td className="px-4 py-3 text-right">
                          <span className="px-2 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700">
                            {workerCount} funcionário{workerCount !== 1 ? "s" : ""}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>

        <button
          onClick={handleConfirm}
          disabled={loading}
          className="w-full py-3 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700 transition disabled:bg-green-300 disabled:cursor-not-allowed"
        >
          {loading ? "Iniciando..." : "Iniciar Produção"}
        </button>
      </div>
    </div>
  );
}

export default OrderConfirm;