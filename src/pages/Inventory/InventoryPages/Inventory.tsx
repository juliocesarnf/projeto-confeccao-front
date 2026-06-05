import { useEffect, useRef, useState, type ReactNode } from "react";
import { Search, Plus } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import ProductService from "../../../services/ProductService";
import MaterialsService from "../../../services/MaterialService";
import type { Product } from "../../../types/ProductType";
import type { Material } from "../../../types/MaterialType";
import ProductCard from "../Cards/ProductCard";
import MaterialCard from "../Cards/MaterialCard";

// ─── Types ───────────────────────────────────────────────────────────────────

type Tab = "produtos" | "materiais";

// ─── Constants ────────────────────────────────────────────────────────────────

const TAB_CLASSES = {
  base: "px-2 py-2 flex-1 text-center rounded-md border transition-all duration-200 font-medium text-sm sm:text-base",
  active: "bg-blue-600 text-white border-blue-600 shadow-sm",
  inactive: "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100",
};

// ─── Component ────────────────────────────────────────────────────────────────

type InventoryLocationState = {
  notification?: { type: "success" | "error"; message: string };
};

function Inventory(): ReactNode {
  const navigate = useNavigate();
  const location = useLocation();
  const notified = useRef(false);

  const [tab, setTab]           = useState<Tab>("produtos");
  const [search, setSearch]     = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    if (notified.current) return;
    notified.current = true;
    const state = location.state as InventoryLocationState | null;
    if (state?.notification) {
      toast[state.notification.type](state.notification.message, {
        position: "top-right",
        autoClose: 5000,
      });
    }
    navigate(location.pathname, { replace: true, state: null });
  }, []);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true);
        const [prods, mats] = await Promise.all([
          ProductService.listAll(),
          MaterialsService.listAll(),
        ]);
        setProducts(prods);
        setMaterials(mats);
      } catch {
        // Erro já notificado pelo interceptor da API.
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  const normalize = (s: string) =>
    s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

  const query = normalize(search);

  const filteredProducts = products.filter(
    (p) =>
      normalize(p.name).includes(query) ||
      normalize(p.category ?? "").includes(query) ||
      normalize(p.description ?? "").includes(query)
  );

  const filteredMaterials = materials.filter((m) =>
    normalize(m.name).includes(query)
  );

  return (
    <div className="w-full max-w-6xl flex flex-col gap-4 px-0 sm:px-4">

      {/* Abas */}
      <div className="flex gap-2">
        {(["produtos", "materiais"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => { setTab(t); setSearch(""); }}
            className={`${TAB_CLASSES.base} ${tab === t ? TAB_CLASSES.active : TAB_CLASSES.inactive}`}
          >
            {t === "produtos" ? "Produtos" : "Materiais"}
          </button>
        ))}
        <button
          onClick={() => navigate(tab === "produtos" ? "/inventory/product/new" : "/inventory/material/new")}
          className="flex items-center gap-1 px-3 py-2 rounded-md border border-green-200 bg-green-50 text-green-700 hover:bg-green-100 transition-all font-medium text-sm shrink-0"
        >
          <Plus className="w-4 h-4" />
          Novo
        </button>
      </div>

      {/* Busca */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        <input
          type="text"
          placeholder={`Buscar ${tab === "produtos" ? "produto" : "material"}...`}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white"
        />
      </div>

      {/* Conteúdo */}
      {loading ? (
        <div className="fixed inset-0 md:left-64 bottom-16 md:bottom-0 flex justify-center items-center bg-white/60 backdrop-blur-sm z-50">
          <div className="w-10 h-10 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
        </div>
      ) : tab === "produtos" ? (
        filteredProducts.length === 0 ? (
          <p className="text-center text-gray-500 mt-8">Nenhum produto encontrado.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )
      ) : (
        filteredMaterials.length === 0 ? (
          <p className="text-center text-gray-500 mt-8">Nenhum material encontrado.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredMaterials.map((m) => (
              <MaterialCard key={m.id} material={m} />
            ))}
          </div>
        )
      )}

    </div>
  );
}

export default Inventory;
