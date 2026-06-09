import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { toast } from "react-toastify";
import type { Customer } from "../types/CustomerType";
import type { Product, ProductVariation } from "../types/ProductType";
import CustomerService from "../services/CustomerService";
import ProductService from "../services/ProductService";

// ─── Types ────────────────────────────────────────────────────────────────────

export type OrderLineItem = {
  variationId: number;
  productName: string;
  size: string | null;
  color: string | null;
  quantity: number;
};

type VariationCache = Record<number, ProductVariation[]>;

type OrderNewContextType = {
  customers: Customer[];
  loadingCustomers: boolean;
  selectedCustomer: Customer | null;
  setSelectedCustomer: (c: Customer | null) => void;
  dueDate: string;
  setDueDate: (v: string) => void;

  search: string;
  setSearch: (v: string) => void;
  filteredProducts: Product[];
  loadingProducts: boolean;

  expandedProductId: number | null;
  selectProduct: (product: Product) => void;
  variationsByProduct: VariationCache;
  loadingVariations: boolean;

  items: OrderLineItem[];
  addVariation: (variation: ProductVariation, productName: string) => void;
  removeItem: (variationId: number) => void;
  updateQuantity: (variationId: number, delta: number) => void;
  setQuantity: (variationId: number, quantity: number) => void;
};

// ─── Context ──────────────────────────────────────────────────────────────────

const OrderNewContext = createContext<OrderNewContextType | null>(null);

export function OrderNewProvider({ children }: { children: ReactNode }) {
  const [customers, setCustomers]               = useState<Customer[]>([]);
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [dueDate, setDueDate]                   = useState("");

  const [search, setSearch]               = useState("");
  const [products, setProducts]           = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);

  const [expandedProductId, setExpandedProductId]   = useState<number | null>(null);
  const [variationsByProduct, setVariationsByProduct] = useState<VariationCache>({});
  const [loadingVariations, setLoadingVariations]   = useState(false);

  const [items, setItems] = useState<OrderLineItem[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        setLoadingCustomers(true);
        const data = await CustomerService.listAll();
        setCustomers(Array.isArray(data) ? data : []);
      } catch {
        toast.error("Erro ao carregar clientes.", { position: "top-right", autoClose: 4000 });
      } finally {
        setLoadingCustomers(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        setLoadingProducts(true);
        const data = await ProductService.listAll();
        setProducts(Array.isArray(data) ? data : []);
      } catch {
        toast.error("Erro ao carregar produtos.", { position: "top-right", autoClose: 4000 });
      } finally {
        setLoadingProducts(false);
      }
    };
    load();
  }, []);

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const selectProduct = useCallback(
    async (product: Product) => {
      if (expandedProductId === product.id) {
        setExpandedProductId(null);
        return;
      }

      setExpandedProductId(product.id);

      if (variationsByProduct[product.id]) return;

      try {
        setLoadingVariations(true);
        const vars = await ProductService.getVariationsByProductId(product.id);
        setVariationsByProduct((prev) => ({ ...prev, [product.id]: vars }));
      } catch {
        // handled by API interceptor
      } finally {
        setLoadingVariations(false);
      }
    },
    [expandedProductId, variationsByProduct]
  );

  const addVariation = useCallback(
    (variation: ProductVariation, productName: string) => {
      setItems((prev) => {
        const existing = prev.find((i) => i.variationId === variation.id);
        if (existing) {
          return prev.map((i) =>
            i.variationId === variation.id ? { ...i, quantity: i.quantity + 1 } : i
          );
        }
        return [
          ...prev,
          {
            variationId: variation.id,
            productName,
            size: variation.size,
            color: variation.color,
            quantity: 1,
          },
        ];
      });
    },
    []
  );

  const removeItem = useCallback((variationId: number) => {
    setItems((prev) => prev.filter((i) => i.variationId !== variationId));
  }, []);

  const updateQuantity = useCallback((variationId: number, delta: number) => {
    setItems((prev) =>
      prev
        .map((i) =>
          i.variationId === variationId ? { ...i, quantity: i.quantity + delta } : i
        )
        .filter((i) => i.quantity > 0)
    );
  }, []);

  const setQuantity = useCallback((variationId: number, quantity: number) => {
    if (quantity <= 0) {
      setItems((prev) => prev.filter((i) => i.variationId !== variationId));
    } else {
      setItems((prev) =>
        prev.map((i) => i.variationId === variationId ? { ...i, quantity } : i)
      );
    }
  }, []);

  return (
    <OrderNewContext.Provider
      value={{
        customers, loadingCustomers, selectedCustomer, setSelectedCustomer,
        dueDate, setDueDate,
        search, setSearch,
        filteredProducts, loadingProducts,
        expandedProductId, selectProduct,
        variationsByProduct, loadingVariations,
        items, addVariation, removeItem, updateQuantity, setQuantity,
      }}
    >
      {children}
    </OrderNewContext.Provider>
  );
}

export function useOrderNew() {
  const ctx = useContext(OrderNewContext);
  if (!ctx) throw new Error("useOrderNew must be used within an OrderNewProvider");
  return ctx;
}
