import { useEffect, useRef, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Minus,
  Plus,
  Save,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "react-toastify";
import { OrderNewProvider, useOrderNew } from "../../../context/OrderNewContext";
import OrderService from "../../../services/OrderService";

// ─── Inner component (consumes context) ──────────────────────────────────────

function OrderNewContent(): ReactNode {
  const navigate = useNavigate();
  const [saving, setSaving]                 = useState(false);
  const [searchOpen, setSearchOpen]         = useState(false);
  const [customerOpen, setCustomerOpen]     = useState(false);
  const [customerInput, setCustomerInput]   = useState("");
  const searchRef   = useRef<HTMLDivElement>(null);
  const customerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
      }
      if (customerRef.current && !customerRef.current.contains(e.target as Node)) {
        setCustomerOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const {
    customers, loadingCustomers, selectedCustomer, setSelectedCustomer,
    dueDate, setDueDate,
    search, setSearch,
    filteredProducts, loadingProducts,
    expandedProductId, selectProduct,
    variationsByProduct, loadingVariations,
    items, addVariation, removeItem, updateQuantity, setQuantity,
  } = useOrderNew();

  const filteredCustomers = customers.filter((c) =>
    c.name.toLowerCase().includes(customerInput.toLowerCase())
  );

  async function handleSave() {
    if (!selectedCustomer) {
      toast.error("Selecione um cliente.", { position: "top-right", autoClose: 4000 });
      return;
    }
    if (!dueDate) {
      toast.error("O prazo de entrega é obrigatório.", { position: "top-right", autoClose: 4000 });
      return;
    }

    try {
      setSaving(true);
      await OrderService.createOrder({
        customerId: selectedCustomer.id,
        dueDate,
        items: items.map((i) => ({ variationId: i.variationId, quantity: i.quantity })),
      });

      navigate("/orders", {
        state: { notification: { type: "success", message: "Pedido criado com sucesso!" } },
      });
    } catch (error: any) {
      if (!error.response) {
        toast.error("Servidor inacessível.", { position: "top-right", autoClose: 5000 });
        return;
      }
      const status = error.response.status;
      const msg = error.response.data?.message ?? "Erro ao criar pedido.";
      toast.error(`Erro ${status}: ${msg}`, { position: "top-right", autoClose: 5000 });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="w-full max-w-6xl flex flex-col gap-5 px-0 sm:px-4 pb-8 overflow-x-hidden">

      {/* Header */}
      <header className="flex items-center gap-2 border-b pb-3">
        <button
          onClick={() => navigate("/orders")}
          className="p-1.5 rounded-md text-gray-500 hover:bg-gray-100 transition-colors shrink-0"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1 text-center">
          <h1 className="text-xl font-semibold">Novo Pedido</h1>
        </div>
        <div className="w-8 shrink-0" />
      </header>

      {/* Dados do pedido */}
      <div className="flex flex-col gap-3">
        <div ref={customerRef} className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">
            Cliente <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type="text"
              value={selectedCustomer ? selectedCustomer.name : customerInput}
              onFocus={() => { setCustomerOpen(true); if (selectedCustomer) setCustomerInput(""); }}
              onChange={(e) => { setCustomerInput(e.target.value); setSelectedCustomer(null); setCustomerOpen(true); }}
              placeholder="Buscar cliente..."
              className="w-full px-3 py-2 pr-8 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white"
            />
            {selectedCustomer && (
              <button
                onClick={() => { setSelectedCustomer(null); setCustomerInput(""); setCustomerOpen(false); }}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {customerOpen && (
            <div className="flex flex-col border border-gray-200 rounded-md overflow-hidden divide-y divide-gray-100 max-h-48 overflow-y-auto">
              {loadingCustomers ? (
                <div className="flex justify-center py-3">
                  <div className="w-5 h-5 border-2 border-gray-200 border-t-blue-500 rounded-full animate-spin" />
                </div>
              ) : filteredCustomers.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-3">Nenhum cliente encontrado.</p>
              ) : filteredCustomers.map((c) => (
                <button
                  key={c.id}
                  onClick={() => { setSelectedCustomer(c); setCustomerInput(""); setCustomerOpen(false); }}
                  className="w-full px-3 py-2.5 text-left text-sm text-gray-800 hover:bg-blue-50 transition-colors"
                >
                  {c.name}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">
            Prazo de entrega <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white text-gray-800"
          />
        </div>
      </div>

      {/* Busca de produtos */}
      <div ref={searchRef} className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Produtos</h2>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={search}
            onFocus={() => setSearchOpen(true)}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Pesquisar produto..."
            className="w-full pl-9 pr-8 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Resultados */}
        {searchOpen && loadingProducts ? (
          <div className="flex justify-center py-4">
            <div className="w-6 h-6 border-2 border-gray-200 border-t-blue-500 rounded-full animate-spin" />
          </div>
        ) : searchOpen && search && filteredProducts.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4">Nenhum produto encontrado.</p>
        ) : searchOpen && search ? (
          <div className="w-full flex flex-col border border-gray-200 rounded-md overflow-hidden divide-y divide-gray-100">
            {filteredProducts.map((product) => {
              const isExpanded = expandedProductId === product.id;
              const vars = variationsByProduct[product.id] ?? [];

              return (
                <div key={product.id} className="min-w-0 overflow-hidden">
                  {/* Linha do produto */}
                  <button
                    onClick={() => selectProduct(product)}
                    className="w-full min-w-0 overflow-hidden flex items-center justify-between px-3 py-2.5 text-left hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-1 min-w-0 overflow-hidden">
                      <p className="text-sm font-medium text-gray-800 wrap-break-word">{product.name}</p>
                      {product.category && (
                        <p className="text-xs text-gray-400">{product.category}</p>
                      )}
                    </div>
                    {isExpanded
                      ? <ChevronUp className="w-4 h-4 text-gray-400 shrink-0" />
                      : <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
                    }
                  </button>

                  {/* Variações do produto expandido */}
                  {isExpanded && (
                    <div className="bg-gray-50 border-t border-gray-100 divide-y divide-gray-100">
                      {loadingVariations && vars.length === 0 ? (
                        <div className="flex justify-center py-3">
                          <div className="w-5 h-5 border-2 border-gray-200 border-t-blue-500 rounded-full animate-spin" />
                        </div>
                      ) : vars.length === 0 ? (
                        <p className="text-xs text-gray-400 text-center py-3">Sem variações cadastradas.</p>
                      ) : (
                        vars.map((v) => {
                          const label = [v.size, v.color].filter(Boolean).join(" · ") || "Padrão";
                          const alreadyAdded = items.some((i) => i.variationId === v.id);
                          return (
                            <button
                              key={v.id}
                              onClick={() => addVariation(v, product.name)}
                              className="w-full min-w-0 overflow-hidden flex items-center justify-between px-4 py-2.5 hover:bg-blue-50 transition-colors text-left"
                            >
                              <div className="flex-1 min-w-0 overflow-hidden">
                                <span className="text-sm text-gray-700 truncate block">{label}</span>
                                <span className="text-xs text-gray-400">Estoque: {v.stock}</span>
                              </div>
                              <div className="flex items-center gap-1.5 shrink-0">
                                {alreadyAdded && (
                                  <span className="text-xs font-medium text-blue-600">
                                    +{items.find((i) => i.variationId === v.id)!.quantity}
                                  </span>
                                )}
                                <Plus className="w-4 h-4 text-blue-500" />
                              </div>
                            </button>
                          );
                        })
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : null}
      </div>

      {/* Lista de itens do pedido agrupados por produto */}
      {items.length > 0 && (() => {
        const groups = items.reduce<Record<string, typeof items>>((acc, item) => {
          (acc[item.productName] ??= []).push(item);
          return acc;
        }, {});

        return (
          <div className="flex flex-col gap-3">
            <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
              Itens do pedido ({items.length})
            </h2>

            <div className="w-full flex flex-col border border-gray-200 rounded-md overflow-hidden divide-y divide-gray-100">
              {Object.entries(groups).map(([productName, groupItems]) => (
                <div key={productName} className="min-w-0 overflow-hidden">

                  {/* Nome do produto */}
                  <div className="px-3 py-2 bg-gray-50 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-800 wrap-break-word">{productName}</p>
                  </div>

                  {/* Variações do produto */}
                  <div className="divide-y divide-gray-100">
                    {groupItems.map((item) => {
                      const label = [item.size, item.color].filter(Boolean).join(" · ") || "Padrão";
                      return (
                        <div
                          key={item.variationId}
                          className="flex items-center gap-2 px-4 py-2.5 bg-white"
                        >
                          <span className="flex-1 min-w-0 text-sm text-gray-700 wrap-break-word">
                            {label}
                          </span>

                          {/* Controle de quantidade */}
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              onClick={() => updateQuantity(item.variationId, -1)}
                              className="w-7 h-7 flex items-center justify-center rounded-md border border-gray-200 text-gray-600 hover:bg-gray-100 transition-colors"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <input
                              type="number"
                              min={1}
                              value={item.quantity}
                              onChange={(e) => setQuantity(item.variationId, parseInt(e.target.value) || 1)}
                              className="w-12 text-center text-sm font-medium text-gray-800 border border-gray-200 rounded-md py-1 focus:outline-none focus:ring-2 focus:ring-blue-300"
                            />
                            <button
                              onClick={() => updateQuantity(item.variationId, 1)}
                              className="w-7 h-7 flex items-center justify-center rounded-md border border-gray-200 text-gray-600 hover:bg-gray-100 transition-colors"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <button
                            onClick={() => removeItem(item.variationId)}
                            className="w-7 h-7 flex items-center justify-center rounded-md text-red-400 hover:bg-red-50 transition-colors shrink-0"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      );
                    })}
                  </div>

                </div>
              ))}
            </div>
          </div>
        );
      })()}

      {/* Botão salvar */}
      <button
        onClick={handleSave}
        disabled={saving}
        className="flex items-center justify-center gap-2 w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-medium rounded-md transition-colors text-sm"
      >
        <Save className="w-4 h-4" />
        {saving ? "Salvando..." : "Salvar"}
      </button>

    </div>
  );
}

// ─── Root component (provides context) ───────────────────────────────────────

function OrderNew(): ReactNode {
  return (
    <OrderNewProvider>
      <OrderNewContent />
    </OrderNewProvider>
  );
}

export default OrderNew;
