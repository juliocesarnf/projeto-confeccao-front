import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useProduction } from "../../../context/ProductionContext";
import MaterialsService from "../../../services/MaterialService";
import { 
  type MaterialVariationInfo, 
  type RequiredMaterialSuppliers 
} from "../../../types/MaterialType";
import OrderHeader from "../Header/OrderHeader";
import Loading from "../../../components/Loading";
import { toast } from "react-toastify";

function OrderMaterialsShoping() {
  const navigate = useNavigate();
  const { orderMaterialsRequided } = useProduction();
  const [suppliers, setSuppliers] = useState<RequiredMaterialSuppliers[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSuppliers() {
      if (!orderMaterialsRequided || orderMaterialsRequided.length === 0) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const data = await MaterialsService.getRequiredMaterialsSuppliers(orderMaterialsRequided);
        setSuppliers(data);
      } catch (error) {
        console.error("Erro ao buscar fornecedores:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchSuppliers();
  }, [orderMaterialsRequided]);

  async function handleFinalizePurchase() {
    toast.info(
      ({ closeToast }) => (
        <div className="flex flex-col gap-3">
          <p className="text-sm font-medium text-gray-800">
            Deseja confirmar a compra dos insumos necessários?
          </p>
          <div className="flex justify-end gap-2">
            <button
              onClick={closeToast}
              className="px-3 py-1.5 text-xs font-semibold text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition"
            >
              Não
            </button>
            <button
              onClick={async () => {
                closeToast();
                await executePurchase();
              }}
              className="px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 transition"
            >
              Sim
            </button>
          </div>
        </div>
      ),
      {
        position: "top-center",
        autoClose: false, // Impede que feche sozinho antes do usuário decidir
        closeOnClick: false,
      }
    );
  }

  async function executePurchase() {
    try {
      await MaterialsService.purchaseMaterials(orderMaterialsRequided);
      toast.success("Compra registrada e estoque atualizado!");
      navigate("/orders");
    } catch (error) {
      console.error("Erro ao processar compra:", error);
    }
  }

  const groupedMaterials = groupByMaterial(orderMaterialsRequided || []);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loading />
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-1 sm:px-4 py-4 flex flex-col gap-4">
      <button
        onClick={() => navigate(-1)}
        className="text-sm text-gray-500 hover:text-gray-700 w-fit"
      >
        ← Back
      </button>

      <div className="bg-white border rounded-xl shadow-sm p-4 flex flex-col gap-6">
        <OrderHeader title="Compra de Insumos" />

        <div className="flex flex-col divide-y divide-gray-100">
          {groupedMaterials.length === 0 ? (
            <div className="py-10 text-center text-gray-500">
              Nenhum material necessário encontrado.
            </div>
          ) : (
            groupedMaterials.map((group) => {
              const materialSuppliers = suppliers.find(
                (s) => s.materialId === group.materialId || s.materialName === group.materialName
              );

              return (
                <div key={group.materialId ?? group.materialName} className="py-6 first:pt-0 last:pb-0 flex flex-col gap-4">
                  {/* Material Header */}
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{group.materialName}</h3>
                      <p className="text-sm text-gray-500">
                        Total Necessário: <span className="font-medium text-gray-700">{group.totalQuantity.toFixed(2)} {group.baseUnit}</span>
                      </p>
                    </div>
                  </div>

                  {/* Variations Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {group.variations.map((v) => (
                      <div key={v.variationId} className="flex justify-between items-center bg-gray-50 px-3 py-2 rounded-lg border border-gray-100">
                        <span className="text-sm text-gray-600">{v.variation}</span>
                        <span className="text-sm font-semibold text-blue-600">
                          {v.quantity.toFixed(2)} {v.baseUnit}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Suppliers Section */}
                  <div className="mt-2">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                      Fornecedores Sugeridos
                    </h4>
                    {materialSuppliers && materialSuppliers.suppliers.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {materialSuppliers.suppliers.map((sup) => (
                          <div
                            key={sup.supplierId}
                            className="bg-green-50 border border-green-200 rounded-lg p-3 flex flex-col min-w-40"
                          >
                            <span className="text-sm font-bold text-green-800">{sup.supplierName}</span>
                            <span className="text-xs text-green-600 font-medium">
                              R$ {sup.price.toFixed(2)} / {group.baseUnit}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-gray-400 italic">
                        Nenhum fornecedor encontrado para este material.
                      </p>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        <button
          onClick={handleFinalizePurchase}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition mt-4"
        >
          Finalizar Lista de Compras
        </button>
      </div>
    </div>
  );
}

type GroupedMaterial = {
  materialId: number | null;
  materialName: string;
  baseUnit: string;
  variations: MaterialVariationInfo[];
  totalQuantity: number;
};

function groupByMaterial(items: MaterialVariationInfo[]): GroupedMaterial[] {
  const map = new Map<string | number, GroupedMaterial>();

  for (const item of items) {
    const key = item.materialId ?? item.material;
    const existing = map.get(key);

    if (existing) {
      existing.variations.push(item);
      existing.totalQuantity += item.quantity;
    } else {
      map.set(key, {
        materialId: item.materialId,
        materialName: item.material,
        baseUnit: item.baseUnit,
        variations: [item],
        totalQuantity: item.quantity,
      });
    }
  }

  return Array.from(map.values());
}

export default OrderMaterialsShoping;