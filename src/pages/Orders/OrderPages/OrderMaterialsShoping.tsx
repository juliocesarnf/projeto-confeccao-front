import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
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
  const { orderMaterialsRequided, order } = useProduction();
  const [suppliers, setSuppliers] = useState<RequiredMaterialSuppliers[]>([]);
  const [loading, setLoading] = useState(true);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

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

  function handleFinalizePurchase() {
    setShowConfirmModal(true);
  }

  async function executePurchase() {
    try {
      await MaterialsService.purchaseMaterials(orderMaterialsRequided);
      toast.success("Compra registrada e estoque atualizado!");
      navigate(`/orders/${order?.id}/materials/select`);
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
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/40">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm mx-4 flex flex-col gap-4">
            <h2 className="text-base font-semibold text-gray-800">Confirmar compra</h2>
            <p className="text-sm text-gray-600">
              Deseja confirmar a compra dos insumos necessários? O estoque será atualizado automaticamente.
            </p>
            <div className="flex justify-end gap-2 mt-2">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 text-sm font-semibold text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
              >
                Cancelar
              </button>
              <button
                onClick={async () => {
                  setShowConfirmModal(false);
                  await executePurchase();
                }}
                className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
      <button
        onClick={() => navigate(-1)}
        className="text-sm text-gray-500 hover:text-gray-700 w-fit"
      >
        <ArrowLeft size={20} />
      </button>

      <div className="bg-white border rounded-xl shadow-sm p-4 flex flex-col gap-6">
        <OrderHeader title="Compra de Insumos" />

        <div className="flex flex-col divide-y divide-gray-100">
          {groupedMaterials.length === 0 ? (
            <div className="py-10 text-center text-gray-500 text-sm">
              Nenhum material necessário encontrado.
            </div>
          ) : (
            groupedMaterials.map((group) => {
              const materialSuppliers = suppliers.find(
                (s) => s.materialId === group.materialId || s.materialName === group.materialName
              );

              return (
                <div key={group.materialId ?? group.materialName} className="py-5 first:pt-0 last:pb-0 flex flex-col gap-3">
                  {/* Material Header */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-1.5 h-6 rounded-full bg-blue-500 shrink-0" />
                      <h3 className="text-sm font-bold text-gray-900 truncate">{group.materialName}</h3>
                    </div>
                    <span className="text-xs font-semibold text-blue-600 bg-blue-50 border border-blue-100 rounded-full px-2.5 py-0.5 shrink-0 whitespace-nowrap">
                      {group.totalQuantity.toFixed(2)} {group.baseUnit}
                    </span>
                  </div>

                  {/* Variations Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                    {group.variations.map((v) => (
                      <div key={v.variationId} className="flex flex-col bg-gray-50 px-2.5 py-1.5 rounded-lg border border-gray-100">
                        <span className="text-xs text-gray-500 truncate">{v.variation}</span>
                        <span className="text-xs font-semibold text-blue-600">
                          {v.quantity.toFixed(2)} {v.baseUnit}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Suppliers Section */}
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                      Fornecedores Sugeridos
                    </p>
                    {materialSuppliers && materialSuppliers.suppliers.length > 0 ? (
                      <div className="grid grid-cols-2 gap-2">
                        {materialSuppliers.suppliers.map((sup) => (
                          <div
                            key={sup.supplierId}
                            className="bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2 flex flex-col justify-between gap-1"
                          >
                            <span className="text-xs font-semibold text-emerald-800 leading-tight line-clamp-2 wrap-break-word">
                              {sup.supplierName}
                            </span>
                            <span className="text-[11px] text-emerald-600 font-medium">
                              R$ {sup.price.toFixed(2)} / {group.baseUnit}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-gray-400 italic">
                        Nenhum fornecedor encontrado.
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
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 active:bg-blue-800 transition text-sm"
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