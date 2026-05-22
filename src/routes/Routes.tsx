import type { ReactNode } from "react";
import { Route, Routes } from "react-router-dom";
import { Layout } from "../components/Layout";
import Orders from "../pages/Orders/OrderPages/Orders";
import Inventory from "../pages/Inventory/Inventory";
import Reports from "../pages/Reports/ReportPages/Reports";
import OrderParts from "../pages/Orders/OrderPages/OrderParts";
import OrderMaterials from "../pages/Orders/OrderPages/OrderMaterials";
import OrderMaterialsSelect from "../pages/Orders/OrderPages/OrderMaterialsSelect";
import OrderMaterialsShoping from "../pages/Orders/OrderPages/OrderMaterialsShoping";
import OrderTeam from "../pages/Orders/OrderPages/OrderTeam";
import OrderConfirm from "../pages/Orders/OrderPages/OrderConfirm";
import { ProductionProvider } from "../context/ProductionContext";
import OrderProduction from "../pages/Orders/OrderPages/OrderProduction";

function RoutesApp(): ReactNode {
  return(
    <ProductionProvider>
      <Layout>
        <Routes>
          <Route path="/" element={<Orders />} /> 
          <Route path="/orders" element={<Orders />} />
          <Route path="/orders/:id" element={<OrderParts />} />
          <Route path="/orders/:id/producao" element={<OrderProduction />} />
          <Route path="/orders/:id/materials" element={<OrderMaterials />} />
          <Route path="/orders/:id/materials/select" element={<OrderMaterialsSelect />} />
          <Route path="/orders/:id/materials/shoping" element={<OrderMaterialsShoping />} />
          <Route path="/orders/:id/team" element={<OrderTeam />} />
          <Route path="/orders/:id/confirm" element={<OrderConfirm />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/reports" element={<Reports />} />
        </Routes>
      </Layout>
    </ProductionProvider>
  )
}

export default RoutesApp;
