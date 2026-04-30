import { useEffect, useState } from "react";
import MaterialsService from "../../services/MaterialsService";

function useMaterials() {
  const [materials, setMaterials] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadMaterials() {
      try {
        setLoading(true);

        const response = await MaterialsService.listAllVariations();

        // 🔥 GARANTE ARRAY SEMPRE
        const data = Array.isArray(response)
          ? response
          : response.materiais;

        setMaterials(data || []);

      } catch (e) {
        setError("Erro ao carregar materiais");
      } finally {
        setLoading(false);
      }
    }

    loadMaterials();
  }, []);

  return {
    materials,
    loading,
    error
  };
}

export default useMaterials;