import { useState, useEffect } from "react";
import {
  obtenerTiposDocumento,
  obtenerRegimenesTributarios,
  obtenerTiposPersona
} from "../../api/proveedoresAPI";

// Si deseas tipar mejor, define interfaces
interface CatalogoItem {
  id: number;
  nombre: string;
  // Podrías añadir más campos si tu API retorna "abreviatura", etc.
}

export const useCatalogosProveedores = () => {
  const [tiposDocumento, setTiposDocumento] = useState<CatalogoItem[]>([]);
  const [regimenesTributarios, setRegimenesTributarios] = useState<CatalogoItem[]>([]);
  const [tiposPersona, setTiposPersona] = useState<CatalogoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCatalogos = async () => {
      setLoading(true);
      setError(null);
      try {
        const [documentos, regimenes, personas] = await Promise.all([
          obtenerTiposDocumento(),
          obtenerRegimenesTributarios(),
          obtenerTiposPersona()
        ]);
        // documentos, regimenes, personas son arrays de {id, nombre, ...}
        setTiposDocumento(documentos || []);
        setRegimenesTributarios(regimenes || []);
        setTiposPersona(personas || []);
      } catch (err) {
        console.error("Error cargando catálogos:", err);
        setError("Ocurrió un error al cargar los catálogos.");
      } finally {
        setLoading(false);
      }
    };

    fetchCatalogos();
  }, []);

  return { 
    tiposDocumento,
    regimenesTributarios,
    tiposPersona,
    loading,
    error,
  };
};
