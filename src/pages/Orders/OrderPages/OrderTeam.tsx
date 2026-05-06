import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ProductService from "../../../services/ProductService";
import { useProduction } from "../../../context/ProductionContext";
import type { ProductToDo } from "../../../types/ProductType";
import type { AssignmentMap, Worker } from "../../../types/WorkerType";
import WorkerService from "../../../services/WorkerService";
import OrderHeader from "../Header/OrderHeader";

function OrderTeam() {
  const navigate = useNavigate();
  const { order, orderProducts } = useProduction();

  const [workers, setWorkers] = useState<Worker[]>([]);
  const [productsWithProcesses, setProductsWithProcesses] = useState<ProductToDo[]>([]);
  const [assignments, setAssignments] = useState<AssignmentMap>({});
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  useEffect(() => {
    async function loadWorkers() {
      const w = await WorkerService.getWorkers();
      setWorkers(w);
    }
    loadWorkers();
  }, []);

  useEffect(() => {
    async function loadProcesses() {
      if (!orderProducts || orderProducts.length === 0) return;
      const p = await ProductService.getProcessesByProductList(orderProducts);
      setProductsWithProcesses(p);
    }
    loadProcesses();
  }, [orderProducts]);

  function toggleWorker(productId: number, processId: number, workerId: number) {
    setAssignments((prev) => {
      const product = prev[productId] ?? {};
      const current = product[processId] ?? [];
      const updated = current.includes(workerId)
        ? current.filter((id) => id !== workerId)
        : [...current, workerId];

      return {
        ...prev,
        [productId]: { ...product, [processId]: updated },
      };
    });
  }

  function getSelected(productId: number, processId: number): number[] {
    return assignments[productId]?.[processId] ?? [];
  }

  function getWorkerName(id: number): string {
    return workers.find((w) => w.id === id)?.name ?? "";
  }

  const dropdownKey = (productId: number, processId: number) =>
    `${productId}-${processId}`;

  if (!order) return <p className="p-4 text-gray-500">Pedido não encontrado</p>;

  return (
    <div className="w-full max-w-4xl mx-auto px-2 sm:px-4 py-4">
      <button
        onClick={() => navigate(-1)}
        className="mb-3 text-sm text-gray-500 hover:text-gray-700"
      >
        ← Back
      </button>

      <div className="bg-white border rounded-xl shadow-sm p-4 flex flex-col gap-6">
        <OrderHeader title="Selecionar Equipe" />

        {productsWithProcesses.map((product) => (
          <div key={product.productId} className="flex flex-col gap-2">
            <h3 className="text-sm font-semibold text-gray-700">
              {product.name}
            </h3>

            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium">Processo</th>
                    <th className="px-4 py-3 text-left font-medium">Selecionar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {product.processes?.map((process) => {
                    const key = dropdownKey(product.productId, process.id);
                    const selected = getSelected(product.productId, process.id);
                    const isOpen = openDropdown === key;

                    return (
                      <tr key={process.id} className="bg-white hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 text-gray-700 font-medium">
                          {process.name}
                        </td>

                        <td className="px-4 py-3">
                          <div className="relative inline-block">
                            <button
                              onClick={() => setOpenDropdown(isOpen ? null : key)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                            >
                              Responsáveis
                              <span className={`transition-transform duration-150 ${isOpen ? "rotate-180" : ""}`}>
                                ▾
                              </span>
                            </button>

                            {isOpen && (
                              <div className="absolute left-0 top-full mt-1 z-50 bg-white border border-gray-200 rounded-lg shadow-lg min-w-[200px] max-h-52 overflow-y-auto">
                                {workers.length === 0 ? (
                                  <p className="px-4 py-3 text-xs text-gray-400">Nenhum funcionário cadastrado</p>
                                ) : (
                                  workers.map((worker) => {
                                    const checked = selected.includes(worker.id);
                                    return (
                                      <label
                                        key={worker.id}
                                        className="flex items-center gap-2.5 px-4 py-2.5 cursor-pointer hover:bg-gray-50 text-sm text-gray-700"
                                      >
                                        <input
                                          type="checkbox"
                                          checked={checked}
                                          onChange={() =>
                                            toggleWorker(product.productId, process.id, worker.id)
                                          }
                                          className="accent-blue-600 w-3.5 h-3.5"
                                        />
                                        {worker.name}
                                      </label>
                                    );
                                  })
                                )}
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ))}

        <button
          onClick={() => {}}
          className="mt-2 w-full py-3 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition"
        >
          Confirmar Equipe
        </button>
      </div>
    </div>
  );
}

export default OrderTeam;