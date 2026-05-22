import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useProduction } from "../../../context/ProductionContext";
import ProductService from "../../../services/ProductService";
import {
  type Material,
  type MaterialVariation,
  type MaterialVariationInfo,
  type ProductMaterial,
} from "../../../types/MaterialType";
import type { RequiredProduct } from "../../../types/ProductType";
import OrderHeader from "../Header/OrderHeader";
import Loading from "../../../components/Loading";

function OrderMaterials() {
  const [view, setView] = useState<"required" | "stock">("required");
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const {
    orderProductsVariations,
    setOrderMaterialsSelect,
    setOrderMaterialsRequided,
  } = useProduction();

  const [requiredMaterials, setRequiredMaterials] = useState<MaterialResult[]>([]);
  const [stockMaterials, setStockMaterials] = useState<MaterialResult[]>([]);
  const [loadingTable, setLoadingTable] = useState(true);

  useEffect(() => {
    async function loadMaterials() {
      setLoadingTable(true);
      try {
        const productsIdList = orderProductsVariations.map(
          (item) => item.productVariationId
        );

        const allMaterials = await ProductService.getProductMaterialsByIdList(productsIdList);

        const result = calculateMaterials(orderProductsVariations, allMaterials);

        setRequiredMaterials(result.requiredMaterials);
        setStockMaterials(result.stockMaterials);
        setOrderMaterialsSelect(result.totalMaterials);
        setOrderMaterialsRequided(result.requiredMaterialsInfo);
      } finally {
        setLoadingTable(false);
      }
    }

    loadMaterials();
  }, [orderProductsVariations, setOrderMaterialsSelect, setOrderMaterialsRequided]);

  const visibleMaterials = view === "required" ? requiredMaterials : stockMaterials;
  const groupedMaterials = groupByMaterial(visibleMaterials);
  const hasRequiredMaterials = requiredMaterials.length > 0;
  const nextMaterialsPath = id
    ? `/orders/${id}/materials/${hasRequiredMaterials ? "shoping" : "select"}`
    : "/orders";

  return (
    <div className="w-full max-w-4xl mx-auto px-1 sm:px-4 py-4">

      <button
        onClick={() => navigate(-1)}
        className="mb-3 text-sm text-gray-500 hover:text-gray-700"
      >
        ← Back
      </button>

      <div className="bg-white border rounded-xl shadow-sm p-4 flex flex-col gap-4">

        <OrderHeader title="Materiais do Pedido" />

        {/* TABS */}
        <div className="flex gap-2">
          <button
            onClick={() => setView("required")}
            className={`flex-1 py-2 rounded-md text-sm font-medium transition
              ${view === "required" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600"}`}
          >
            Necessários ({requiredMaterials.length})
          </button>

          <button
            onClick={() => setView("stock")}
            className={`flex-1 py-2 rounded-md text-sm font-medium transition
              ${view === "stock" ? "bg-green-600 text-white" : "bg-gray-100 text-gray-600"}`}
          >
            Em Estoque ({stockMaterials.length})
          </button>
        </div>

        {/* LISTA */}
        <div className="flex flex-col">
          {loadingTable ? (
            <div className="flex justify-center items-center py-10">
              <Loading />
            </div>
          ) : groupedMaterials.length === 0 ? (
            <div className="p-6 text-center text-sm text-gray-500">
              Nenhum material encontrado
            </div>
          ) : (
            <div className="flex flex-col divide-y">
              {groupedMaterials.map((group) => (
                <MaterialGroup key={group.materialId} group={group} view={view} />
              ))}
            </div>
          )}
        </div>

        {/* BOTÃO */}
        <Link
          to={nextMaterialsPath}
          className={`w-full inline-flex justify-center py-3 rounded-md text-sm font-medium transition
            ${loadingTable
              ? "bg-blue-300 pointer-events-none cursor-not-allowed text-white"
              : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
        >
          {hasRequiredMaterials ? "Comprar Insumos" : "Selecionar Insumos"}
        </Link>
      </div>
    </div>
  );
}

/* ================================================= */
/* COMPONENTES */
/* ================================================= */

type GroupedMaterial = {
  materialId: number;
  materialName: string;
  baseUnit: string;
  variations: MaterialResult[];
  totalQuantity: number;
};

type MaterialGroupProps = {
  group: GroupedMaterial;
  view: "required" | "stock";
};

function MaterialGroup({ group, view }: MaterialGroupProps) {
  const accentClass =
    view === "stock"
      ? "bg-green-50 text-green-700"
      : "bg-blue-50 text-blue-700";

  const totalBadgeClass =
    view === "stock"
      ? "bg-green-100 text-green-800 border border-green-200"
      : "bg-blue-100 text-blue-800 border border-blue-200";

  return (
    <div className="py-3 flex flex-col gap-2">
      {/* Cabeçalho do material */}
      <div className="flex justify-between items-center">
        <span className="font-semibold text-gray-800">{group.materialName}</span>
        <span className={`px-3 py-1 rounded-md text-sm font-semibold ${totalBadgeClass}`}>
          {group.totalQuantity.toFixed(2)} {group.baseUnit}
        </span>
      </div>

      {/* Variações */}
      <div className="flex flex-col gap-1 pl-3 border-l-2 border-gray-100">
        {group.variations.map(({ materialVariation, quantity }) => (
          <div key={materialVariation.id} className="flex justify-between items-center">
            <span className="text-sm text-gray-600">{materialVariation.variation}</span>
            <span className={`px-2 py-0.5 rounded text-sm font-medium ${accentClass}`}>
              {quantity.toFixed(2)} {group.baseUnit}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ================================================= */
/* HELPERS */
/* ================================================= */

function groupByMaterial(items: MaterialResult[]): GroupedMaterial[] {
  const map = new Map<number, GroupedMaterial>();

  for (const item of items) {
    const existing = map.get(item.material.id);

    if (existing) {
      existing.variations.push(item);
      existing.totalQuantity += item.quantity;
    } else {
      map.set(item.material.id, {
        materialId: item.material.id,
        materialName: item.material.name,
        baseUnit: item.material.baseUnit,
        variations: [item],
        totalQuantity: item.quantity,
      });
    }
  }

  return Array.from(map.values());
}

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
      (mat) => mat.productVariationId === product.productVariationId
    );

    for (const mat of materials) {
      const id = mat.materialVariation.id;
      const need = product.quantityRequired * mat.quantity;

      if (!totalNeedMap[id]) {
        totalNeedMap[id] = {
          material: mat.material,
          materialVariation: mat.materialVariation,
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
    const stock = item.materialVariation.stock;
    const needed = item.quantity;
    const available = Math.min(stock, needed);
    const missing = needed - available;

    if (available > 0) {
      stockMaterials.push({ ...item, quantity: available });
    }

    if (missing > 0) {
      requiredMaterials.push({ ...item, quantity: missing });
    }
  }

  const totalMaterials: MaterialVariationInfo[] = Object.values(totalNeedMap).map((item) => ({
    materialId: item.material.id,
    variationId: item.materialVariation.id,
    material: item.material.name,
    variation: item.materialVariation.variation,
    quantity: item.quantity,
    baseUnit: item.material.baseUnit,
  }));

  const requiredMaterialsInfo: MaterialVariationInfo[] = requiredMaterials.map((item) => ({
    materialId: item.material.id,
    variationId: item.materialVariation.id,
    material: item.material.name,
    variation: item.materialVariation.variation,
    quantity: item.quantity,
    baseUnit: item.material.baseUnit,
  }));

  return { stockMaterials, requiredMaterials, totalMaterials, requiredMaterialsInfo };
}

export default OrderMaterials;
