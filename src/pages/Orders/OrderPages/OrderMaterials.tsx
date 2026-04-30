import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useProduction, } from "../../../context/ProductionContext";
import ProductService from "../../../services/ProductsService";
import {
  type Material,
  type MaterialVariacao,
  type MaterialVariationInfo,
  type ProdutoMaterial,
} from "../../../types/MaterialType";
import type { RequiredProduct } from "../../../types/ProductType";

function OrderMaterials() {
  const [view, setView] = useState<"required" | "stock">("required");
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { order, orderProductsVariations: orderProducts, setOrderMaterialsSelect } = useProduction();

  const [requiredMaterials, setRequiredMaterials] = useState<
    MaterialResult[]
  >([]);

  const [stockMaterials, setStockMaterials] = useState<
    MaterialResult[]
  >([]);

  useEffect(() => {
    async function loadMaterials() {
      const productsIdsList = orderProducts.map(
        (item) => item.productVariationId
      );

      const allMaterials =
        await ProductService.getProductMaterialsByIdList(
          productsIdsList
        );

      const result = calculateMaterials(
        orderProducts,
        allMaterials
      );

      setRequiredMaterials(result.requiredMaterials);
      setStockMaterials(result.stockMaterials);

      // Calcular total de materiais necessários
      setOrderMaterialsSelect(result.totalMaterials);
    }

    loadMaterials();
  }, [orderProducts, setOrderMaterialsSelect]);

  const visibleMaterials =
    view === "required"
      ? requiredMaterials
      : stockMaterials;

  const dueDate = order ? new Date(order.prazo) : null;
  const today = new Date();
  const diffDays = (order && dueDate)
    ? Math.ceil(
        (dueDate?.getTime() - today.getTime()) /
          (1000 * 60 * 60 * 24)
      )
    : 0;

  const statusColor = order
    ? diffDays <= 1
      ? "text-red-600"
      : diffDays <= 3
      ? "text-yellow-600"
      : "text-blue-600"
    : "text-gray-600";

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
        
        {/* HEADER */}
        <header className="flex flex-col gap-3 border-b pb-3">
          <div>
            <h1 className="text-xl font-semibold">Order #{order?.id ?? "—"}</h1>
            <p className="text-sm text-gray-500 mt-1">
              Materiais Necessários
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
              Quantidade total: <span className="font-medium text-gray-800">
                {order?.total_quantidade ?? "—"}
              </span>
            </span>
          </div>
        </header>

        {/* TABS */}
        <div className="flex gap-2">
          <button
            onClick={() => setView("required")}
            className={`flex-1 py-2 rounded-md text-sm font-medium transition
              ${
                view === "required"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-600"
              }`}
          >
            Necessários ({requiredMaterials.length})
          </button>

          <button
            onClick={() => setView("stock")}
            className={`flex-1 py-2 rounded-md text-sm font-medium transition
              ${
                view === "stock"
                  ? "bg-green-600 text-white"
                  : "bg-gray-100 text-gray-600"
              }`}
          >
            Em Estoque ({stockMaterials.length})
          </button>
        </div>

        {/* TABELA */}
        <div className="overflow-hidden rounded-xl bg-white">
          {/* CABEÇALHO */}
          <div className="grid grid-cols-12 px-4 py-3 text-sm font-semibold text-gray-600">
            <div className="col-span-9">Material</div>
            <div className="col-span-3 text-right">Quantidade</div>
          </div>

          {/* LINHAS */}
          <div>
            {visibleMaterials.map((item) => (
              <div
                key={item.material_variacao.id}
                className="grid grid-cols-12 px-4 py-3 items-center"
              >
                {/* MATERIAL */}
                <div className="col-span-9 flex flex-col">
                  <span className="font-medium">
                    {item.material.nome}
                  </span>

                  <span className="text-xs text-gray-500">
                    {item.material_variacao.variacao}
                  </span>
                </div>

                {/* QUANTIDADE */}
                <div className="col-span-3 text-right">
                  <span
                    className={`px-3 py-1 rounded-md text-sm font-medium
                      ${
                        view === "stock"
                          ? "bg-green-50 text-green-700"
                          : "bg-blue-50 text-blue-700"
                      }`}
                  >
                    {item.quantity}
                  </span>
                </div>
              </div>
            ))}

            {visibleMaterials.length === 0 && (
              <div className="p-6 text-center text-sm text-gray-500">
                Nenhum material encontrado
              </div>
            )}
          </div>
        </div>

        {/* BOTÃO */}
        <Link
          to={id ? `/orders/${id}/materials/select` : "/orders"}
          className="w-full inline-flex justify-center py-3 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition"
        >
          Selecionar Insumos
        </Link>
      </div>
    </div>
  );
}

export default OrderMaterials;

/* ================================================= */
/* TYPES */
/* ================================================= */

type MaterialResult = {
  material: Material;
  material_variacao: MaterialVariacao;
  quantity: number;
};

/* ================================================= */
/* CALCULO */
/* ================================================= */

function calculateMaterials(
  orderProducts: RequiredProduct[],
  allMaterials: ProdutoMaterial[]
) {
  const totalNeedMap: Record<number, MaterialResult> = {};

  for (const product of orderProducts) {
    const materials = allMaterials.filter(
      (mat) =>
        mat.variacao_produto_id ===
        product.productVariationId
    );

    for (const mat of materials) {
      const id = mat.material_variacao.id;

      const need =
        product.quantityRequired *
        mat.quantidade;

      if (!totalNeedMap[id]) {
        totalNeedMap[id] = {
          material: mat.material,
          material_variacao:
            mat.material_variacao,
          quantity: 0,
        };
      }

      totalNeedMap[id].quantity += need;
    }
  }

  const stockMaterials: MaterialResult[] = [];
  const requiredMaterials: MaterialResult[] = [];

  for (const id in totalNeedMap) {
    const item = totalNeedMap[id];

    const stock =
      item.material_variacao.estoque;

    const needed = item.quantity;

    const available = Math.min(
      stock,
      needed
    );

    const missing =
      needed - available;

    if (available > 0) {
      stockMaterials.push({
        ...item,
        quantity: available,
      });
    }

    if (missing > 0) {
      requiredMaterials.push({
        ...item,
        quantity: missing,
      });
    }
  }

  const totalMaterials: MaterialVariationInfo[] = Object.values(
    totalNeedMap
  ).map((item) => ({
    variacao_id: item.material_variacao.id,
    material: item.material.nome,
    variacao: item.material_variacao.variacao,
    quantidade: item.quantity,
    unidade_base: item.material.unidade_base,
  }));

  return {
    stockMaterials,
    requiredMaterials,
    totalMaterials,
  };
}