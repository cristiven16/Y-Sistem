// src/api/ubicacionesAPI.ts
import axios from "axios";
import { API_BASE_URL } from "./config";

export const obtenerDepartamentos = async (): Promise<any[]> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/ubicaciones/departamentos`);
    return response.data;
  } catch (error) {
    console.error("Error al obtener departamentos:", error);
    return [];
  }
};

export const obtenerCiudades = async (departamentoId: number): Promise<any[]> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/ubicaciones/ciudades`, {
      params: { departamento_id: departamentoId },
    });
    return response.data;
  } catch (error) {
    console.error("Error al obtener ciudades:", error);
    return [];
  }
};
