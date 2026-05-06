import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useProduction, } from "../../../context/ProductionContext";
import ProductService from "../../../services/ProductService";
import {
  type Material,
  type MaterialVariation,
  type MaterialVariationInfo,
  type ProductMaterial,
} from "../../../types/MaterialType";
import type { RequiredProduct } from "../../../types/ProductType";
import OrderHeader from "../Header/OrderHeader";

function OrderMaterials() {
  
  const [view, setView] = useState<"required" | "stock">("required");
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { order, orderProductsVariations, orderProducts, setOrderMaterialsSelect } = useProduction();

  const [requiredMaterials, setRequiredMaterials] = useState<
    MaterialResult[]
  >([]);

  const [stockMaterials, setStockMaterials] = useState<
    MaterialResult[]
  >([]);

  useEffect(() => {
    async function loadMaterials() {
      const productsIdList = orderProductsVariations.map(
        (item) => item.productVariationId
      );

      const allMaterials =
        await ProductService.getProductMaterialsByIdList(
          productsIdList
        );

      const result = calculateMaterials(
        orderProductsVariations,
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

  const dueDate = order ? new Date(order.dueDate) : null;
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
        <OrderHeader title='Materiais do Pedido' />

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
                key={item.materialVariation.id}
                className="grid grid-cols-12 px-4 py-3 items-center"
              >
                {/* MATERIAL */}
                <div className="col-span-9 flex flex-col">
                  <span className="font-medium">
                    {item.material.name}
                  </span>

                  <span className="text-xs text-gray-500">
                    {item.materialVariation.variation}
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
  materialVariation: MaterialVariation;
  quantity: number;
};

/* ================================================= */
/* CALCULO */
/* ================================================= */

function calculateMaterials(
  orderProducts: RequiredProduct[],
  allMaterials: ProductMaterial[]
) {
  const totalNeedMap: Record<number, MaterialResult> = {};

  for (const product of orderProducts) {
    const materials = allMaterials.filter(
      (mat) =>
        mat.productVariationId ===
        product.productVariationId
    );

    for (const mat of materials) {
      const id = mat.materialVariation.id;

      const need =
        product.quantityRequired *
        mat.quantity;

      if (!totalNeedMap[id]) {
        totalNeedMap[id] = {
          material: mat.material,
          materialVariation:
            mat.materialVariation,
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
      item.materialVariation.stock;

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
    variationId: item.materialVariation.id,
    material: item.material.name,
    variation: item.materialVariation.variation,
    quantity: item.quantity,
    baseUnit: item.material.baseUnit,
  }));

  return {
    stockMaterials,
    requiredMaterials,
    totalMaterials,
  };
}
