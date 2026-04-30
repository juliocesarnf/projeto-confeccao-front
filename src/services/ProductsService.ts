import type { ProdutoMaterial } from "../types/MaterialType";
import type { ProductToDo } from "../types/ProductType";
import API from "./API";

const ProductService = {
  async getProductMaterialsById(id: number): Promise<any> {
    const response = await API.get<ProdutoMaterial[]>(`/produtos/variacao/${id.toString()}/materiais`);
    return response.data;
  },
  async getProductMaterialsByIdList(ids: number[]): Promise<any> {
    const response = await API.post<ProdutoMaterial[]>(
      "/produtos/variacoes/materiais/search",
      { ids }
    );
    return response.data;
  },
  async getProcessById(products: ProductToDo[]): Promise<any> {
    const response = await API.post(`/produtos/processos/search`, { products });
    console.log("Processos recebidos:", response.data);
    return response.data;
  }
};

export default ProductService;