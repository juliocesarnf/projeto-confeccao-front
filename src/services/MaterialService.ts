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
      materialVariationId: material.variationId,
      quantity: material.quantity,
    }));

    const response = await API.post("/materiais/variacoes/remover-estoque", payload);
    return response.data;
  },

  async getRequiredMaterialsSuppliers(
    materials: MaterialVariationInfo[]
  ): Promise<RequiredMaterialSuppliers[]> {
    const payload = materials.map((material) => ({
      materialId: material.materialId,
    }));

    const response = await API.post<RequiredMaterialSuppliers[]>("/materiais/fornecedores", payload);
    return response.data;
  },

  async purchaseMaterials(materials: MaterialVariationInfo[]): Promise<any> {
    const payload = materials.map((material) => ({
      materialVariationId: material.variationId,
      quantity: material.quantity,
    }));
    const response = await API.post("/materiais/compra", payload);
    return response;
  }
};

export default MaterialsService;
