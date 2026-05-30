import type { ProductMaterial } from "../types/MaterialType";
import type { ProductToDo, ProductProcessesResult } from "../types/ProductType";
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
    const productIds = products.map((p) => p.productId);
    const response = await API.post<ProductProcessesResult[]>(
      "/produtos/processos/search",
      { productIds }
    );
    const processMap = new Map(response.data.map((r) => [r.productId, r.processes]));
    return products.map((p) => ({ ...p, processes: processMap.get(p.productId) ?? [] }));
  }
};

export default ProductService;
