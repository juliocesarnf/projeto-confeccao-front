import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ProductService from "../../../services/ProductService";
import { useProduction } from "../../../context/ProductionContext";
import type { ProductToDo } from "../../../types/ProductType";
import type { AssignmentMap, Worker } from "../../../types/WorkerType";
import WorkerService from "../../../services/WorkerService";
import OrderHeader from "../Header/OrderHeader";
import Loading from "../../../components/Loading";

function OrderTeam() {
  const navigate = useNavigate();
  const { order, orderProducts, setOrderTeamAssignments, setOrderProducts } = useProduction();

  const [workers, setWorkers] = useState<Worker[]>([]);
  const [productsWithProcesses, setProductsWithProcesses] = useState<ProductToDo[]>([]);
  const [assignments, setAssignments] = useState<AssignmentMap>({});
  const [submitted, setSubmitted] = useState(false);
  const [loadingWorkers, setLoadingWorkers] = useState(true);
  const [loadingProcesses, setLoadingProcesses] = useState(true);

  useEffect(() => {
    async function loadWorkers() {
      setLoadingWorkers(true);
      try {
        const w = await WorkerService.getWorkers();
        setWorkers(w);
      } finally {
        setLoadingWorkers(false);
      }
    }
    loadWorkers();
  }, []);

  useEffect(() => {
    async function loadProcesses() {
      if (!orderProducts || orderProducts.length === 0) {
        setLoadingProcesses(false);
        return;
      }
      setLoadingProcesses(true);
      try {
        const p = await ProductService.getProcessesByProductList(orderProducts);
        setProductsWithProcesses(p);
        setOrderProducts(p);
      } finally {
        setLoadingProcesses(false);
      }
    }
    loadProcesses();
  }, []);

  function toggleWorker(productId: number, processId: number, workerId: number) {
    setAssignments((prev) => {
      const product = prev[productId] ?? {};
      const current = product[processId] ?? [];
      const updated = current.includes(workerId)
        ? current.filter((id) => id !== workerId)
        : [...current, workerId];
      return { ...prev, [productId]: { ...product, [processId]: updated } };
    });
  }

  function getSelected(productId: number, processId: number): number[] {
    return assignments[productId]?.[processId] ?? [];
  }

  function isMissingWorker(productId: number, processId: number): boolean {
    return submitted && getSelected(productId, processId).length === 0;
  }

  function handleConfirmTeam() {
    setSubmitted(true);

    const hasMissing = productsWithProcesses.some((product) =>
      (product.processes ?? []).some(
        (process) => getSelected(product.productId, process.processId).length === 0
      )
    );

    if (hasMissing) return;

    setOrderTeamAssignments(
      productsWithProcesses.flatMap((product) =>
        (product.processes ?? []).flatMap((process) =>
          getSelected(product.productId, process.processId).map((workerId) => ({
            productId: product.productId,
            processId: process.processId,
            workerId,
          }))
        )
      )
    );

    if (!order) return;
    navigate(`/orders/${order.id}/confirm`);
  }

  const isLoading = loadingWorkers || loadingProcesses;

  if (!order) return <p className="p-4 text-gray-500">Pedido não encontrado</p>;

  return (
    <div className="w-full max-w-4xl mx-auto px-1 sm:px-4 py-1">
      <button
        onClick={() => navigate(-1)}
        className="mb-3 text-sm text-gray-500 hover:text-gray-700"
      >
        <ArrowLeft size={20} />
      </button>

      <div className="bg-white border rounded-xl shadow-sm p-4 flex flex-col gap-5">
        <OrderHeader title="Selecionar Equipe" />

        {isLoading ? (
          <div className="flex justify-center items-center py-10">
            <Loading />
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {productsWithProcesses.map((product) => (
              <div key={product.productId} className="flex flex-col gap-3">
                {/* Product title */}
                <div className="flex items-center gap-2">
                  <div className="w-1 h-5 rounded-full bg-blue-500 shrink-0" />
                  <h3 className="text-sm font-bold text-gray-800">{product.name}</h3>
                  <span className="text-xs text-gray-400 font-normal">
                    × {product.quantity}
                  </span>
                </div>

                {/* Processes */}
                <div className="flex flex-col gap-2 pl-3 border-l-2 border-gray-100">
                  {(product.processes ?? []).map((process) => {
                    const selected = getSelected(product.productId, process.processId);
                    const missing = isMissingWorker(product.productId, process.processId);

                    return (
                      <div
                        key={process.processId}
                        className={`rounded-xl border p-3 flex flex-col gap-2.5 transition-colors ${
                          missing
                            ? "border-red-200 bg-red-50"
                            : selected.length > 0
                            ? "border-blue-100 bg-blue-50/40"
                            : "border-gray-200 bg-gray-50"
                        }`}
                      >
                        {/* Process header */}
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-semibold text-gray-700">
                            {process.name}
                          </span>
                          {missing ? (
                            <span className="text-[10px] font-semibold text-red-500 bg-red-100 px-2 py-0.5 rounded-full">
                              Obrigatório
                            </span>
                          ) : selected.length > 0 ? (
                            <span className="text-[10px] font-semibold text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">
                              {selected.length} selecionado{selected.length > 1 ? "s" : ""}
                            </span>
                          ) : null}
                        </div>

                        {/* Worker chips */}
                        <div className="flex flex-wrap gap-1.5">
                          {workers.length === 0 ? (
                            <p className="text-xs text-gray-400 italic">
                              Nenhum funcionário cadastrado
                            </p>
                          ) : (
                            workers
                              .filter((w) => w.active)
                              .map((worker) => {
                                const isSelected = selected.includes(worker.id);
                                return (
                                  <button
                                    key={worker.id}
                                    type="button"
                                    onClick={() =>
                                      toggleWorker(product.productId, process.processId, worker.id)
                                    }
                                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
                                      isSelected
                                        ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                                        : "bg-white text-gray-600 border-gray-300 hover:border-blue-400 hover:text-blue-600"
                                    }`}
                                  >
                                    {worker.name}
                                  </button>
                                );
                              })
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

            {submitted && (
              (() => {
                const totalMissing = productsWithProcesses.reduce((acc, product) =>
                  acc + (product.processes ?? []).filter(
                    (p) => getSelected(product.productId, p.processId).length === 0
                  ).length, 0
                );
                return totalMissing > 0 ? (
                  <p className="text-xs text-red-500 text-center">
                    Selecione pelo menos um funcionário para cada processo destacado em vermelho.
                  </p>
                ) : null;
              })()
            )}
          </div>
        )}

        <button
          onClick={handleConfirmTeam}
          disabled={isLoading}
          className="mt-2 w-full py-3 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition disabled:cursor-not-allowed disabled:bg-blue-300"
        >
          Confirmar Equipe
        </button>
      </div>
    </div>
  );
}

export default OrderTeam;
