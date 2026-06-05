import { createContext, useContext, useState, type ReactNode } from "react";
import type { Material, MaterialVariation } from "../types/MaterialType";

type MaterialContextType = {
  selectedMaterial: Material | null;
  setSelectedMaterial: React.Dispatch<React.SetStateAction<Material | null>>;
  selectedVariation: MaterialVariation | null;
  setSelectedVariation: React.Dispatch<React.SetStateAction<MaterialVariation | null>>;
};

const MaterialContext = createContext<MaterialContextType | null>(null);

type MaterialProviderProps = {
  children: ReactNode;
};

export function MaterialProvider({ children }: MaterialProviderProps) {
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);
  const [selectedVariation, setSelectedVariation] = useState<MaterialVariation | null>(null);

  return (
    <MaterialContext.Provider value={{ selectedMaterial, setSelectedMaterial, selectedVariation, setSelectedVariation }}>
      {children}
    </MaterialContext.Provider>
  );
}

export function useMaterial() {
  const context = useContext(MaterialContext);

  if (!context) {
    throw new Error("useMaterial must be used within a MaterialProvider");
  }

  return context;
}
