import type { 
  MaterialVariationInfo, 
  RequiredMaterialSuppliers 
} from "../types/MaterialType";
import API from "./API";

export type MaterialVariationListResponse =
  | MaterialVariationInfo[]
  | { materiais: MaterialVariationInfo[] };

const MaterialsService = {
  async listAllVariations(): Promise<MaterialVariationListResponse> {
    const response = await API.get("/materiais/variacoes");
    console.log(response);
    return response.data;
  },

  async createKit(materials: MaterialVariationInfo[]): Promise<unknown> {
    const payload = materials.map((material) => ({
      variacao_id: material.variationId,
      material: material.material,
      variacao: material.variation,
      quantidade: material.quantity,
      unidade_base: material.baseUnit,
    }));

    const response = await API.post("/materiais/variacoes/remover-estoque", payload);
    return response.data;
  },

  async getRequiredMaterialsSuppliers(
    materials: MaterialVariationInfo[]
  ): Promise<RequiredMaterialSuppliers[]> {
    const payload = materials.map((material) => ({
      materialId: material.materialId,
      variationId: material.variationId,
      material: material.material,
      variation: material.variation,
      quantity: material.quantity,
      baseUnit: material.baseUnit,
    }));

    const response = await API.post<RequiredMaterialSuppliers[]>("/materiais/fornecedores", payload);
    return response.data;
  },

  async purchaseMaterials(materials: MaterialVariationInfo[]): Promise<any> {

  }
};

export default MaterialsService;
