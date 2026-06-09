import type { ProductMaterial } from "../types/MaterialType";
import type { Product, ProductToDo, ProductProcessesResult, ProductVariation, CreateProductPayload } from "../types/ProductType";
import API from "./API";

const ProductService = {
  async listAll(): Promise<Product[]> {
    const response = await API.get<Product[]>("/produtos");
    return response.data;
  },

  async createProduct(data: CreateProductPayload): Promise<Product> {
    const response = await API.post<Product>("/produtos", data);
    return response.data;
  },

  async getVariationsByProductId(id: number): Promise<ProductVariation[]> {
    const response = await API.get<ProductVariation[]>(`/produtos/${id}/variacoes`);
    return response.data;
  },

  async createVariation(productId: number, data: { size: string | null; color: string | null; stock: number }): Promise<ProductVariation> {
    const response = await API.post<ProductVariation>(`/produtos/${productId}/variacoes`, data);
    return response.data;
  },

  async updateVariation(id: number, data: { size: string | null; color: string | null; stock: number }): Promise<ProductVariation> {
    const response = await API.put<ProductVariation>(`/produtos/variacoes/${id}`, data);
    return response.data;
  },

  async addStock(id: number): Promise<ProductVariation> {
    const response = await API.patch<ProductVariation>(`/produtos/variacoes/${id}/adicionar`);
    return response.data;
  },

  async removeStock(id: number): Promise<ProductVariation> {
    const response = await API.patch<ProductVariation>(`/produtos/variacoes/${id}/remover`);
    return response.data;
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
