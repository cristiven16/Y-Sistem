import { useState, useEffect } from "react";
import { obtenerTiposDocumento, obtenerRegimenesTributarios, obtenerTiposPersona } from "./clientesAPI";

export const useCatalogosClientes = () => {
    const [tiposDocumento, setTiposDocumento] = useState<string[]>([]);
    const [regimenesTributarios, setRegimenesTributarios] = useState<string[]>([]);
    const [tiposPersona, setTiposPersona] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCatalogos = async () => {
            try {
                const [documentos, regimenes, personas] = await Promise.all([
                    obtenerTiposDocumento(),
                    obtenerRegimenesTributarios(),
                    obtenerTiposPersona()
                ]);
                setTiposDocumento(documentos.map(doc => doc.nombre) || []);
                setRegimenesTributarios(regimenes.map(reg => reg.nombre) || []);
                setTiposPersona(personas.map(per => per.nombre) || []);
            } catch (error) {
                console.error("Error cargando catálogos: ", error);
            } finally {
                setLoading(false);
            }
        };

        fetchCatalogos();
    }, []);

    return { tiposDocumento, regimenesTributarios, tiposPersona, loading };
};
