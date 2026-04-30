import type { MaterialVariationInfo } from "../types/MaterialType";
import API from "./API";

const MaterialsService = {
  async listAllVariations(): Promise<any> {
    const response = await API.get("/materiais/variacoes");
    console.log(response);
    return response.data;
  },

  async createKit(materials: MaterialVariationInfo[]): Promise<any> {
    const response = await API.post("/materiais/variacoes/remover-estoque", materials);
    return response.data;
  }
};

export default MaterialsService;