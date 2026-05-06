import type { MaterialVariationInfo } from "../types/MaterialType";
import API from "./API";

const MaterialsService = {
  async listAllVariations(): Promise<any> {
    const response = await API.get("/materiais/variacoes");
    console.log(response);
    return response.data;
  },

  async createKit(materials: MaterialVariationInfo[]): Promise<any> {
    const payload = materials.map((material) => ({
      variacao_id: material.variationId,
      material: material.material,
      variacao: material.variation,
      quantidade: material.quantity,
      unidade_base: material.base_unit,
    }));

    const response = await API.post("/materiais/variacoes/remover-estoque", payload);
    return response.data;
  }
};

export default MaterialsService;
