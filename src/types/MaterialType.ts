export type MaterialVariacao = {
  id: number;
  variacao: string;
  estoque: number;
};

export type Material = {
  id: number;
  nome: string;
  unidade_base: string;
};

export type MaterialVariationInfo = {
  variacao_id: number;
  material: string;
  variacao: string;
  quantidade: number;
  unidade_base: string;
};

export type ProdutoMaterial = {
  id: number;
  produto_id: number;
  quantidade: number;
  variacao_produto_id: number;
  material_variacao: MaterialVariacao;
  material: Material;
};

export type ProdutoMaterialResponse = {
  produto_id: number;
  variacao_produto_id: number;
  materiais: ProdutoMaterial[];
};