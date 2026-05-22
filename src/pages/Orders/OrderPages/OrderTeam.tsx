import { useEffect, useState, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import ProductService from "../../../services/ProductService";
import { useProduction } from "../../../context/ProductionContext";
import type { ProductToDo } from "../../../types/ProductType";
import type { AssignmentMap, Worker } from "../../../types/WorkerType";
import WorkerService from "../../../services/WorkerService";
import OrderHeader from "../Header/OrderHeader";
import Loading from "../../../components/Loading";

function WorkerDropdown({
  workers,
  selected,
  onToggle,
  anchorRef,
  onClose,
}: {
  workers: Worker[];
  selected: number[];
  onToggle: (workerId: number) => void;
  anchorRef: React.RefObject<HTMLButtonElement>;
  onClose: () => void;
}) {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [style, setStyle] = useState<React.CSSProperties>({});

  useEffect(() => {
    if (!anchorRef.current) return;
    const rect = anchorRef.current.getBoundingClientRect();
    setStyle({
      position: "fixed",
      top: rect.bottom + 4,
      left: rect.left,
      zIndex: 9999,
      minWidth: 200,
    });
  }, [anchorRef]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        anchorRef.current &&
        !anchorRef.current.contains(e.target as Node)
      ) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose, anchorRef]);

  return createPortal(
    <div
      ref={dropdownRef}
      style={style}
      className="bg-white border border-gray-200 rounded-lg shadow-lg max-h-52 overflow-y-auto"
    >
      {workers.length === 0 ? (
        <p className="px-4 py-3 text-xs text-gray-400">
          Nenhum funcionário cadastrado
        </p>
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
                onChange={() => onToggle(worker.id)}
                className="accent-blue-600 w-3.5 h-3.5"
              />
              {worker.name}
            </label>
          );
        })
      )}
    </div>,
    document.body
  );
}

function OrderTeam() {
  const navigate = useNavigate();
  const {
    order,
    orderProducts,
    setOrderTeamAssignments,
    setOrderProducts,
  } = useProduction();

  const [workers, setWorkers] = useState<Worker[]>([]);
  const [productsWithProcesses, setProductsWithProcesses] = useState<ProductToDo[]>([]);
  const [assignments, setAssignments] = useState<AssignmentMap>({});
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [teamNotification, setTeamNotification] = useState<{
    type: "error" | "success";
    message: string;
  } | null>(null);
  const [loadingWorkers, setLoadingWorkers] = useState(true);   // <-- loading workers
  const [loadingProcesses, setLoadingProcesses] = useState(true); // <-- loading processos

  const buttonRefs = useRef<Record<string, HTMLButtonElement | null>>({});

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

      return {
        ...prev,
        [productId]: { ...product, [processId]: updated },
      };
    });
  }

  function getSelected(productId: number, processId: number): number[] {
    return assignments[productId]?.[processId] ?? [];
  }

  function handleConfirmTeam() {
    const missingProcesses = productsWithProcesses.flatMap((product) =>
      (product.processes ?? [])
        .filter((process) => getSelected(product.productId, process.processId).length === 0)
        .map((process) => `${product.name}: ${process.name}`)
    );

    if (missingProcesses.length > 0) {
      setTeamNotification({
        type: "error",
        message: `Selecione pelo menos um funcionario para: ${missingProcesses.join(", ")}.`,
      });
      return;
    }

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

  const dropdownKey = (productId: number, processId: number) =>
    `${productId}-${processId}`;

  const handleClose = useCallback(() => setOpenDropdown(null), []);

  const isLoading = loadingWorkers || loadingProcesses; // <-- combinado

  if (!order) return <p className="p-4 text-gray-500">Pedido não encontrado</p>;

  return (
    <div className="w-full max-w-4xl mx-auto px-1 sm:px-4 py-1">
      <button
        onClick={() => navigate(-1)}
        className="mb-3 text-sm text-gray-500 hover:text-gray-700"
      >
        ← Back
      </button>

      <div className="bg-white border rounded-xl shadow-sm p-4 flex flex-col gap-6">
        <OrderHeader title="Selecionar Equipe" />

        {/* CONTEÚDO COM LOADING */}
        {isLoading ? (
          <div className="flex justify-center items-center py-10">
            <Loading />
          </div>
        ) : (
          <>
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
                        const key = dropdownKey(product.productId, process.processId);
                        const selected = getSelected(product.productId, process.processId);
                        const isOpen = openDropdown === key;
                        const anchorRef = {
                          current: buttonRefs.current[key] ?? null,
                        } as React.RefObject<HTMLButtonElement>;

                        return (
                          <tr key={process.processId} className="bg-white hover:bg-gray-50 transition-colors">
                            <td className="px-4 py-3 text-gray-700 font-medium">
                              {process.name}
                            </td>
                            <td className="px-4 py-3">
                              <button
                                ref={(el) => { buttonRefs.current[key] = el; }}
                                onClick={() => setOpenDropdown(isOpen ? null : key)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                              >
                                Responsáveis ({selected.length})
                                <span className={`transition-transform duration-150 ${isOpen ? "rotate-180" : ""}`}>
                                  ▾
                                </span>
                              </button>

                              {isOpen && (
                                <WorkerDropdown
                                  workers={workers}
                                  selected={selected}
                                  onToggle={(workerId) =>
                                    toggleWorker(product.productId, process.processId, workerId)
                                  }
                                  anchorRef={anchorRef}
                                  onClose={handleClose}
                                />
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}

            {teamNotification && (
              <p
                className={`text-sm ${
                  teamNotification.type === "error" ? "text-red-600" : "text-green-600"
                }`}
              >
                {teamNotification.message}
              </p>
            )}
          </>
        )}

        <button
          onClick={handleConfirmTeam}
          disabled={isLoading}
          className="mt-2 w-full py-3 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition disabled:cursor-not-allowed disabled:bg-blue-300"
        >
          Confirmar Equipe
        </button>
      </div>
    </div>
  );
}

export default OrderTeam;