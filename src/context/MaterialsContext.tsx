// MaterialsContext.tsx
import { createContext, useContext, useEffect, useState } from "react";
import MaterialsService from "../services/MaterialsService";

const MaterialsContext = createContext<any>(null);

export function MaterialsProvider({ children }: any) {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const data = await MaterialsService.getAll();
      setMaterials(data);
      setLoading(false);
    }

    load();
  }, []);

  return (
    <MaterialsContext.Provider value={{ materials, loading }}>
      {children}
    </MaterialsContext.Provider>
  );
}

export function useMaterials() {
  return useContext(MaterialsContext);
}