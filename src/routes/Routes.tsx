import type { ReactNode } from "react";
import { Route, Routes } from "react-router-dom";
import { Layout } from "../components/Layout";
import Orders from "../pages/Orders/OrderPages/Orders";
import Inventory from "../pages/Inventory/Inventory";
import Reports from "../pages/Reports/Reports";
import OrderParts from "../pages/Orders/OrderPages/OrderParts";
import OrderMaterials from "../pages/Orders/OrderPages/OrderMaterials";
import OrderMaterialsSelect from "../pages/Orders/OrderPages/OrderMaterialsSelect";
import OrderTeam from "../pages/Orders/OrderPages/OrderTeam";
import { ProductionProvider } from "../context/ProductionContext";

function RoutesApp(): ReactNode {
  return(
    <ProductionProvider>
      <Layout>
        <Routes>
          <Route path="/" element={<Orders />} /> 
          <Route path="/orders" element={<Orders />} />
          <Route path="/orders/:id" element={<OrderParts />} />
          <Route path="/orders/:id/materials" element={<OrderMaterials />} />
          <Route path="/orders/:id/materials/select" element={<OrderMaterialsSelect />} />
          <Route path="/orders/:id/team" element={<OrderTeam />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/reports" element={<Reports />} />
        </Routes>
      </Layout>
    </ProductionProvider>
  )
}

export default RoutesApp;