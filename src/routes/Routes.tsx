import type { ReactNode } from "react";
import { Route, Routes } from "react-router-dom";
import { Layout } from "../components/Layout";
import Orders from "../pages/Orders/OrderPages/Orders";
import Inventory from "../pages/Inventory/InventoryPages/Inventory";
import Reports from "../pages/Reports/ReportPages/Reports";
import OrderParts from "../pages/Orders/OrderPages/OrderParts";
import OrderMaterials from "../pages/Orders/OrderPages/OrderMaterials";
import OrderMaterialsSelect from "../pages/Orders/OrderPages/OrderMaterialsSelect";
import OrderMaterialsShoping from "../pages/Orders/OrderPages/OrderMaterialsShoping";
import OrderTeam from "../pages/Orders/OrderPages/OrderTeam";
import OrderConfirm from "../pages/Orders/OrderPages/OrderConfirm";
import { ProductionProvider } from "../context/ProductionContext";
import { ProductProvider } from "../context/ProductContext";
import { MaterialProvider } from "../context/MaterialContext";
import OrderProduction from "../pages/Orders/OrderPages/OrderProduction";
import OrderNew from "../pages/Orders/OrderPages/OrderNew";
import Product from "../pages/Inventory/InventoryPages/Product";
import ProductUpdate from "../pages/Inventory/InventoryPages/ProductUpdate";
import ProductNew from "../pages/Inventory/InventoryPages/ProductNew";
import MaterialPage from "../pages/Inventory/InventoryPages/Material";
import MaterialUpdate from "../pages/Inventory/InventoryPages/MaterialUpdate";
import MaterialNew from "../pages/Inventory/InventoryPages/MaterialNew";
import MaterialVariationNew from "../pages/Inventory/InventoryPages/MaterialVariationNew";
import ProductVariationNew from "../pages/Inventory/InventoryPages/ProductVariationNew";

function RoutesApp(): ReactNode {
  return(
    <ProductionProvider>
    <ProductProvider>
    <MaterialProvider>
      <Layout>
        <Routes>
          <Route path="/" element={<Orders />} /> 
          <Route path="/orders" element={<Orders />} />
          <Route path="/orders/new" element={<OrderNew />} />
          <Route path="/orders/:id" element={<OrderParts />} />
          <Route path="/orders/:id/producao" element={<OrderProduction />} />
          <Route path="/orders/:id/materials" element={<OrderMaterials />} />
          <Route path="/orders/:id/materials/select" element={<OrderMaterialsSelect />} />
          <Route path="/orders/:id/materials/shoping" element={<OrderMaterialsShoping />} />
          <Route path="/orders/:id/team" element={<OrderTeam />} />
          <Route path="/orders/:id/confirm" element={<OrderConfirm />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/inventory/product" element={<Product />} />
          <Route path="/inventory/product/update" element={<ProductUpdate />} />
          <Route path="/inventory/product/new" element={<ProductNew />} />
          <Route path="/inventory/product/variation/new" element={<ProductVariationNew />} />
          <Route path="/inventory/material" element={<MaterialPage />} />
          <Route path="/inventory/material/update" element={<MaterialUpdate />} />
          <Route path="/inventory/material/new" element={<MaterialNew />} />
          <Route path="/inventory/material/variation/new" element={<MaterialVariationNew />} />
          <Route path="/reports" element={<Reports />} />
        </Routes>
      </Layout>
    </MaterialProvider>
    </ProductProvider>
    </ProductionProvider>
  )
}

export default RoutesApp;
