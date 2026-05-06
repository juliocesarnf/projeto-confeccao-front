import { createContext, useContext, useState, type ReactNode } from "react";
import type { MaterialVariationInfo, ProductMaterial } from "../types/MaterialType";
import type { Order } from "../types/OrderType";
import type { ProductToDo, RequiredProduct, OrderTeamAssignment } from "../types/ProductType";


type ProductionContextType = {

  orderProducts: ProductToDo[];
  setOrderProducts: React.Dispatch<React.SetStateAction<ProductToDo[]>>;

  orderProductsVariations: RequiredProduct[];
  setOrderProductsVariations: React.Dispatch<React.SetStateAction<RequiredProduct[]>>;

  orderMaterials: ProductMaterial[];
  setOrderMaterials: React.Dispatch<React.SetStateAction<ProductMaterial[]>>;

  orderTeamAssignments: OrderTeamAssignment[];
  setOrderTeamAssignments: React.Dispatch<React.SetStateAction<OrderTeamAssignment[]>>;

  order: Order | null;
  setOrder: React.Dispatch<React.SetStateAction<Order | null>>;

  orderMaterialsSelect: MaterialVariationInfo[];
  setOrderMaterialsSelect: React.Dispatch<React.SetStateAction<MaterialVariationInfo[]>>;

};

const ProductionContext = createContext<ProductionContextType | null>(null);

type ProductionProviderProps = {
  children: ReactNode;
};

export function ProductionProvider({ children }: ProductionProviderProps) {
  const [orderProducts, setOrderProducts] = useState<ProductToDo[]>([]);
  const [orderProductsVariations, setOrderProductsVariations] = useState<RequiredProduct[]>([]);
  const [orderMaterials, setOrderMaterials] = useState<ProductMaterial[]>([]);
  const [orderTeamAssignments, setOrderTeamAssignments] = useState<OrderTeamAssignment[]>([]);
  const [order, setOrder] = useState<Order | null>(null);
  const [orderMaterialsSelect, setOrderMaterialsSelect] = useState<MaterialVariationInfo[]>([]);
  return (
    <ProductionContext.Provider
      value={{
        orderProducts,
        setOrderProducts,
        orderProductsVariations,
        setOrderProductsVariations,
        orderMaterials,
        setOrderMaterials,
        orderTeamAssignments,
        setOrderTeamAssignments,
        order,
        setOrder,
        orderMaterialsSelect,
        setOrderMaterialsSelect
      }}
    >
      {children}
    </ProductionContext.Provider>
  );
}

export function useProduction() {
  const context = useContext(ProductionContext);

  if (!context) {
    throw new Error("useProduction must be used within a ProductionProvider");
  }

  return context;
}
