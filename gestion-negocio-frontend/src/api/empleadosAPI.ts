// src/api/empleadosAPI.ts
import axios from "axios";
import { API_BASE_URL } from "./config";

const EMPLEADOS_URL = `${API_BASE_URL}/empleados`;

/**
 * Obtener lista de Empleados
 */
export async function obtenerEmpleados(page = 1, search = "", esVendedor?: boolean) {
  const params: any = { page, search };
  if (esVendedor !== undefined) {
    params.es_vendedor = esVendedor;
  }
  const resp = await axios.get(EMPLEADOS_URL, { params });
  return resp.data;
}

/**
 * Crear
 */
export async function crearEmpleado(payload: any) {
  const resp = await axios.post(EMPLEADOS_URL, payload);
  return resp.data;
}

/**
 * Actualizar
 */
export async function actualizarEmpleado(id: number, payload: any) {
  const resp = await axios.put(`${EMPLEADOS_URL}/${id}`, payload);
  return resp.data;
}

/**
 * Eliminar
 */
export async function eliminarEmpleado(id: number) {
  const resp = await axios.delete(`${EMPLEADOS_URL}/${id}`);
  return resp.data;
}

/**
 * Obtener por ID
 */
export async function obtenerEmpleadoPorId(id: number) {
  const resp = await axios.get(`${EMPLEADOS_URL}/${id}`);
  return resp.data;
}

/**
 * Catálogos de Empleado (si tu backend difiere)
 */
export async function obtenerTiposDocumento(): Promise<any[]> {
  try {
    // Si /catalogos/tipos-documento
    const response = await axios.get(`${API_BASE_URL}/catalogos/tipos-documento`);
    return response.data;
  } catch (error) {
    console.error("Error al obtener tipos de documento:", error);
    return [];
  }
}
// ... y así
export async function obtenerEmpleadosVendedores() {
  // Llamamos a /empleados con es_vendedor=true
  const resp = await axios.get(`${API_BASE_URL}/empleados`, {
    params: { es_vendedor: true },
  });
  // Si tu backend retorna { data, page, ... } => retornamos resp.data.data
  // Ajusta según la respuesta real
  return resp.data.data; 
}