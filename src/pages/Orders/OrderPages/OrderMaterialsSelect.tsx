import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useProduction } from "../../../context/ProductionContext";
import MaterialsService from "../../../services/MaterialService";
import OrderHeader from "../Header/OrderHeader";
import Loading from "../../../components/Loading";
import type { MaterialVariationInfo } from "../../../types/MaterialType";

/* ================================================= */
/* TYPES */
/* ================================================= */

type GroupedMaterial = {
  materialName: string;
  baseUnit: string;
  variations: MaterialVariationInfo[];
  totalQuantity: number;
};

/* ================================================= */
/* HELPERS */
/* ================================================= */

function groupByMaterialName(items: MaterialVariationInfo[]): GroupedMaterial[] {
  const map = new Map<string, GroupedMaterial>();

  for (const item of items) {
    const existing = map.get(item.material);

    if (existing) {
      existing.variations.push(item);
      existing.totalQuantity += item.quantity;
    } else {
      map.set(item.material, {
        materialName: item.material,
        baseUnit: item.baseUnit,
        variations: [item],
        totalQuantity: item.quantity,
      });
    }
  }

  return Array.from(map.values());
}

/* ================================================= */
/* COMPONENTES */
/* ================================================= */

type MaterialGroupProps = {
  group: GroupedMaterial;
};

function MaterialGroup({ group }: MaterialGroupProps) {
  return (
    <div className="py-3 flex flex-col gap-2">
      <div className="flex justify-between items-center">
        <span className="font-semibold text-gray-800">{group.materialName}</span>
        <span className="px-3 py-1 rounded-md text-sm font-semibold bg-blue-100 text-blue-800 border border-blue-200">
          {group.totalQuantity.toFixed(2)} {group.baseUnit}
        </span>
      </div>

      <div className="flex flex-col gap-1 pl-3 border-l-2 border-gray-100">
        {group.variations.map((item) => (
          <div key={`${item.variationId}-${item.variation}`} className="flex justify-between items-center">
            <span className="text-sm text-gray-600">{item.variation}</span>
            <span className="px-2 py-0.5 rounded text-sm font-medium bg-blue-50 text-blue-700">
              {item.quantity.toFixed(2)} {item.baseUnit}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ================================================= */
/* PÁGINA */
/* ================================================= */

function OrderSelectMaterials() {
  const navigate = useNavigate();
  const { order, orderMaterialsSelect } = useProduction();
  const [creatingKit, setCreatingKit] = useState(false);
  const [kitMessage, setKitMessage] = useState<string | null>(null);
  const [loadingTable, setLoadingTable] = useState(true);

  useState(() => {
    const timer = setTimeout(() => setLoadingTable(false), 800);
    return () => clearTimeout(timer);
  });

  const groupedMaterials = groupByMaterialName(orderMaterialsSelect);

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
    <div className="w-full max-w-4xl mx-auto px-1 sm:px-4 py-4">
      <button
        onClick={() => navigate(-1)}
        className="mb-3 text-sm text-gray-500 hover:text-gray-700"
      >
        <ArrowLeft size={20} />
      </button>

      <div className="bg-white border rounded-xl shadow-sm p-4 flex flex-col gap-4">
        <OrderHeader title="Selecionar Materiais" />

        <div className="flex flex-col">
          {loadingTable ? (
            <div className="flex justify-center items-center py-10">
              <Loading />
            </div>
          ) : groupedMaterials.length === 0 ? (
            <div className="p-6 text-center text-sm text-gray-500">
              Nenhum material selecionado.
            </div>
          ) : (
            <div className="flex flex-col divide-y">
              {groupedMaterials.map((group) => (
                <MaterialGroup key={group.materialName} group={group} />
              ))}
            </div>
          )}
        </div>

        {kitMessage && (
          <p
            className={`text-sm text-center font-medium ${
              kitMessage.includes("sucesso") ? "text-green-600" : "text-red-500"
            }`}
          >
            {kitMessage}
          </p>
        )}

        <div className="pt-2">
          <button
            onClick={handleCreateKit}
            disabled={creatingKit || loadingTable}
            className="mt-4 w-full py-3 rounded-md bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition disabled:cursor-not-allowed disabled:bg-indigo-300"
          >
            {creatingKit ? "Criando Kit..." : "Criar Kit"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default OrderSelectMaterials;