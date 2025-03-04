// src/api/ubicacionesAPI.ts
import apiClient from "./axiosConfig";

/**
 * Obtener lista de departamentos
 */
export const obtenerDepartamentos = async (): Promise<any[]> => {
  try {
    // Llamamos a "/ubicaciones/departamentos" a través de apiClient
    // (El baseURL y el token se manejan en axiosConfig.ts)
    const response = await apiClient.get("/ubicaciones/departamentos");
    return response.data;
  } catch (error) {
    console.error("Error al obtener departamentos:", error);
    return [];
  }
};

/**
 * Obtener ciudades, filtrando por departamento.
 */
export const obtenerCiudades = async (departamentoId: number): Promise<any[]> => {
  try {
    const response = await apiClient.get("/ubicaciones/ciudades", {
      params: { departamento_id: departamentoId },
    });
    return response.data;
  } catch (error) {
    console.error("Error al obtener ciudades:", error);
    return [];
  }
};
