import { useEffect, useMemo, useState } from "react";
import EmployeesService from "../../../services/EmployeesService";
import ProductService from "../../../services/ProductsService";
import { useProduction } from "../../../context/ProductionContext";
import type {
  ProductProcess,
  ProductToDo,
  OrderTeamAssignment,
} from "../../../types/ProductType";

function OrderTeam() {
  const { order, orderProducts, setOrderTeamAssignments } = useProduction();

  const [employees, setEmployees] = useState<any[]>([]);
  const [productsWithProcesses, setProductsWithProcesses] = useState<
    (ProductToDo & { processos?: ProductProcess[] })[]
  >(orderProducts);
  const [assignments, setAssignments] = useState<OrderTeamAssignment[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [employeeData, productsResponse] = await Promise.all([
          EmployeesService.getEmployees(),
          orderProducts.length > 0
            ? ProductService.getProcessById(orderProducts)
            : Promise.resolve(orderProducts),
        ]);

        setEmployees(employeeData);

        const loadedProducts = Array.isArray(productsResponse)
          ? productsResponse
          : orderProducts;

        setProductsWithProcesses(loadedProducts);

        const initialAssignments = loadedProducts.flatMap(
          (product: ProductToDo & { processos?: ProductProcess[] }) =>
            (product.processos ?? []).map(process => ({
              productId: product.id_Produto,
              processId: process.id,
              employeeId: null,
            }))
        );

        setAssignments(initialAssignments);
        setOrderTeamAssignments(initialAssignments);
      } catch (error) {
        console.error("Erro ao carregar dados do time:", error);
      }
    };

    void loadData();
  }, [orderProducts, setOrderTeamAssignments]);

  const dueDate = order ? new Date(order.prazo) : null;
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

  const handleSelectEmployee = (
    productId: number,
    processId: number,
    employeeId: number | null
  ) => {
    const nextAssignments = assignments.map(item =>
      item.productId === productId && item.processId === processId
        ? { ...item, employeeId }
        : item
    );

    setAssignments(nextAssignments);
    setOrderTeamAssignments(nextAssignments);
  };

  const employeeOptions = useMemo(
    () =>
      employees.map(employee => ({
        id: employee.id,
        label: employee.nome ?? employee.name ?? `Funcionário ${employee.id}`,
      })),
    [employees]
  );

  if (!order) {
    return <p>Pedido não encontrado</p>;
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-2 sm:px-4 py-4">
      <div className="bg-white border rounded-xl shadow-sm p-4 flex flex-col gap-4">
        <header className="flex flex-col gap-3 border-b pb-3">
          <div>
            <h1 className="text-xl font-semibold">Order #{order.id}</h1>
            <p className="text-sm text-gray-500 mt-1">
              Alocar processo para cada produto e selecionar funcionário
            </p>
          </div>

          <div className="text-sm text-gray-500 flex flex-wrap gap-4">
            <span>
              Due date: <span className={`font-medium ${statusColor}`}>
                {dueDate ? dueDate.toLocaleDateString("en-US") : "—"}
              </span>
            </span>

            <span>
              Total: <span className="font-medium text-gray-800">
                $ {order ? Number(order.valor_total || 0).toFixed(2) : "0.00"}
              </span>
            </span>

            <span>
              Quantidade: <span className="font-medium text-gray-800">
                {order?.total_quantidade ?? "—"}
              </span>
            </span>
          </div>
        </header>

        {productsWithProcesses.length === 0 ? (
          <div className="p-4 text-gray-500">
            Não há produtos com processos para mostrar.
          </div>
        ) : (
          productsWithProcesses.map(product => (
            <section
              key={product.id_Produto}
              className="bg-gray-50 border rounded-lg p-4"
            >
              <div className="mb-3">
                <h2 className="text-lg font-semibold">{product.nome}</h2>
                <p className="text-sm text-gray-500">
                  Quantidade: {product.quantidade}
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm text-gray-700">
                  <thead>
                    <tr className="border-b bg-gray-100 text-xs uppercase tracking-wide text-gray-600">
                      <th className="px-3 py-2">Processo</th>
                      <th className="px-3 py-2">Funcionário</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(product.processos ?? []).map(process => {
                      const assignment = assignments.find(
                        item =>
                          item.productId === product.id_Produto &&
                          item.processId === process.id
                      );

                      return (
                        <tr key={process.id} className="border-b last:border-b-0">
                          <td className="px-3 py-3">{process.nome}</td>
                          <td className="px-3 py-3">
                            <select
                              value={assignment?.employeeId ?? ""}
                              onChange={event =>
                                handleSelectEmployee(
                                  product.id_Produto,
                                  process.id,
                                  event.target.value
                                    ? Number(event.target.value)
                                    : null
                                )
                              }
                              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700"
                            >
                              <option value="">Selecione</option>
                              {employeeOptions.map(employee => (
                                <option key={employee.id} value={employee.id}>
                                  {employee.label}
                                </option>
                              ))}
                            </select>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          ))
        )}
      </div>
    </div>
  );
}

export default OrderTeam;
