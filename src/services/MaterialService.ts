import type {
  Material,
  MaterialVariation,
  MaterialVariationInfo,
  RequiredMaterialSuppliers
} from "../types/MaterialType";
import API from "./API";

export type MaterialVariationListResponse =
  | MaterialVariationInfo[]
  | { materiais: MaterialVariationInfo[] };

const MaterialsService = {
  async listAll(): Promise<Material[]> {
    const response = await API.get<Material[]>("/materiais");
    return response.data;
  },

  async createMaterial(data: { name: string; baseUnit: string; quantityPerPackage?: number }): Promise<Material> {
    const response = await API.post<Material>("/materiais", data);
    return response.data;
  },

  async getVariationsByMaterialId(id: number): Promise<MaterialVariation[]> {
    const response = await API.get<MaterialVariation[]>(`/materiais/${id}/variacoes`);
    return response.data;
  },

  async updateVariation(id: number, data: { variation: string; stock: number }): Promise<MaterialVariation> {
    const response = await API.put<MaterialVariation>(`/materiais/variacoes/${id}`, data);
    return response.data;
  },

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
