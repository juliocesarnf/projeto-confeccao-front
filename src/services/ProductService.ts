import type { ProductMaterial } from "../types/MaterialType";
import type { ProductToDo } from "../types/ProductType";
import API from "./API";

const ProductService = {
  async getProductMaterialsById(id: number): Promise<ProductMaterial[]> {
    const response = await API.get<ProductMaterial[]>(`/produtos/variacao/${id.toString()}/materiais`);
    return response.data
  },
  async getProductMaterialsByIdList(ids: number[]): Promise<ProductMaterial[]> {
    const response = await API.post<ProductMaterial[]>(
      "/produtos/variacoes/materiais/search",
      { ids }
    );
    return response.data
  },
  async getProcessesByProductList(products: ProductToDo[]): Promise<ProductToDo[]> {
    const response = await API.post(`/produtos/processos/search`, { products });
    return response.data
     
  }
};

export default ProductService;
