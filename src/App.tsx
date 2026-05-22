import { BrowserRouter } from "react-router-dom";
import { ToastContainer } from "react-toastify";

import { ProductionProvider } from "./context/ProductionContext";
import RoutesApp from "./routes/Routes";

// ─── Component ────────────────────────────────────────────────────────────────

function App() {
  return (
    <BrowserRouter>
      <ProductionProvider>
        <ToastContainer />
        <RoutesApp />
      </ProductionProvider>
    </BrowserRouter>
  );
}

export default App;