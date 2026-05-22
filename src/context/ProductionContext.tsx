import { createContext, useContext, useState, type ReactNode } from "react";
import type { MaterialVariationInfo, ProductMaterial } from "../types/MaterialType";
import type { Order, OrderItem } from "../types/OrderType";
import type { ProductToDo, RequiredProduct, OrderTeamAssignment } from "../types/ProductType";
import type { ProductionDetailView } from "../types/ProductionType";


type ProductionContextType = {

  orderProduction: ProductionDetailView | null;
  setOrderProduction: React.Dispatch<React.SetStateAction<ProductionDetailView | null>>;

  orderProducts: ProductToDo[];
  setOrderProducts: React.Dispatch<React.SetStateAction<ProductToDo[]>>;

  orderItems: OrderItem[];
  setOrderItems: React.Dispatch<React.SetStateAction<OrderItem[]>>;

  orderProductsVariations: RequiredProduct[];
  setOrderProductsVariations: React.Dispatch<React.SetStateAction<RequiredProduct[]>>;

  orderMaterials: ProductMaterial[];
  setOrderMaterials: React.Dispatch<React.SetStateAction<ProductMaterial[]>>;

  orderMaterialsRequided: MaterialVariationInfo[];
  setOrderMaterialsRequided: React.Dispatch<React.SetStateAction<MaterialVariationInfo[]>>;

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
  const [orderProduction, setOrderProduction] = useState<ProductionDetailView | null>(null);
  const [orderProducts, setOrderProducts] = useState<ProductToDo[]>([]);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [orderProductsVariations, setOrderProductsVariations] = useState<RequiredProduct[]>([]);
  const [orderMaterials, setOrderMaterials] = useState<ProductMaterial[]>([]);
  const [orderTeamAssignments, setOrderTeamAssignments] = useState<OrderTeamAssignment[]>([]);
  const [order, setOrder] = useState<Order | null>(null);
  const [orderMaterialsSelect, setOrderMaterialsSelect] = useState<MaterialVariationInfo[]>([]);
  const [orderMaterialsRequided, setOrderMaterialsRequided] = useState<MaterialVariationInfo[]>([]);
  return (
    <ProductionContext.Provider
      value={{
        orderProduction,
        setOrderProduction,
        orderProducts,
        setOrderProducts,
        orderItems,
        setOrderItems,
        orderProductsVariations,
        setOrderProductsVariations,
        orderMaterials,
        setOrderMaterials,
        orderMaterialsRequided,
        setOrderMaterialsRequided,
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
