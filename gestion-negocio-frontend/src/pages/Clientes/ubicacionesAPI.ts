// ubicacionesAPI.ts (o clientesAPI.ts si prefieres unificar)

import axios from "axios";

const API_URL = "http://localhost:8000"; // Ajusta a tu URL real

export const obtenerDepartamentos = async (): Promise<any[]> => {
  try {
    const response = await axios.get(`${API_URL}/ubicaciones/departamentos`);
    return response.data; // un array de { id, nombre }
  } catch (error) {
    console.error("Error al obtener departamentos:", error);
    return [];
  }
};

export const obtenerCiudades = async (departamentoId: number): Promise<any[]> => {
  try {
    const response = await axios.get(`${API_URL}/ubicaciones/ciudades`, {
      params: { departamento_id: departamentoId },
    });
    return response.data; // un array de { id, nombre, departamento_id }
  } catch (error) {
    console.error("Error al obtener ciudades:", error);
    return [];
  }
};
