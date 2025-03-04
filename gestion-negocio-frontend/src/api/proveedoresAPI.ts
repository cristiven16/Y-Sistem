// src/api/proveedoresAPI.ts
import apiClient from "./axiosConfig";
import { ProveedorResponse, ProveedorPayload } from "../pages/Proveedores/proveedoresTypes";

/**
 * Estructura para paginación, según el backend:
 * {
 *   data: ProveedorResponse[],
 *   page: number,
 *   total_paginas: number,
 *   total_registros: number
 * }
 */
export interface PaginatedProveedores {
  data: ProveedorResponse[];
  page: number;
  total_paginas: number;
  total_registros: number;
}

/**
 * Obtener lista paginada de proveedores (GET /proveedores).
 */
export async function getProveedores(
  search: string = "",
  page: number = 1,
  page_size: number = 10
): Promise<PaginatedProveedores> {
  const resp = await apiClient.get("/proveedores", {
    params: { search, page, page_size },
  });
  return resp.data; // => { data, page, total_paginas, total_registros }
}

/**
 * Crear un nuevo proveedor (POST /proveedores).
 * El backend retorna { message, id, numero_documento }.
 */
export async function crearProveedor(payload: ProveedorPayload): Promise<any> {
  // Debes aplanar subobjetos (tipo_documento, departamento, ciudad) antes de enviar.
  // Se haría en tu formulario. 
  const resp = await apiClient.post("/proveedores", payload);
  return resp.data; 
}

/**
 * Actualizar proveedor de forma parcial (PATCH /proveedores/{id}).
 * Retorna el ProveedorResponse con cambios aplicados.
 */
export async function actualizarProveedor(
  proveedorId: number,
  payload: Partial<ProveedorPayload>
): Promise<ProveedorResponse> {
  const resp = await apiClient.patch(`/proveedores/${proveedorId}`, payload);
  return resp.data;
}

/**
 * Eliminar proveedor (DELETE /proveedores/{id}).
 */
export async function deleteProveedor(id: number): Promise<void> {
  await apiClient.delete(`/proveedores/${id}`);
}

/**
 * Obtener un proveedor por ID (GET /proveedores/{id}).
 * Retorna ProveedorResponse.
 */
export async function getProveedorById(id: number): Promise<ProveedorResponse> {
  const resp = await apiClient.get(`/proveedores/${id}`);
  return resp.data;
}

/* ─────────────────────────────────────────────────────────────
   Catálogos. Los definimos según tu backend en /catalogos/...
   ─────────────────────────────────────────────────────────────
*/
export async function obtenerTiposDocumento(): Promise<any[]> {
  try {
    const response = await apiClient.get("/catalogos/tipos-documento");
    return response.data;
  } catch (error) {
    console.error("Error al obtener tipos de documento:", error);
    return [];
  }
}

export async function obtenerRegimenesTributarios(): Promise<any[]> {
  try {
    const response = await apiClient.get("/catalogos/regimenes-tributarios");
    return response.data;
  } catch (error) {
    console.error("Error al obtener regimenes tributarios:", error);
    return [];
  }
}

export async function obtenerTiposPersona(): Promise<any[]> {
  try {
    const response = await apiClient.get("/catalogos/tipos-persona");
    return response.data;
  } catch (error) {
    console.error("Error al obtener tipos de persona:", error);
    return [];
  }
}

export async function obtenerMonedas(): Promise<any[]> {
  try {
    const response = await apiClient.get("/catalogos/monedas");
    return response.data;
  } catch (error) {
    console.error("Error al obtener monedas:", error);
    return [];
  }
}

export async function obtenerTarifasPrecios(): Promise<any[]> {
  try {
    const response = await apiClient.get("/catalogos/tarifas-precios");
    return response.data;
  } catch (error) {
    console.error("Error al obtener tarifas precios:", error);
    return [];
  }
}

export async function obtenerFormasPago(): Promise<any[]> {
  try {
    const response = await apiClient.get("/catalogos/formas-pago");
    return response.data;
  } catch (error) {
    console.error("Error al obtener formas de pago:", error);
    return [];
  }
}

export async function obtenerSucursales(): Promise<any[]> {
  try {
    const response = await apiClient.get("/catalogos/sucursales");
    return response.data;
  } catch (error) {
    console.error("Error al obtener sucursales:", error);
    return [];
  }
}

export async function obtenerActividadesEconomicas(): Promise<any[]> {
  try {
    const response = await apiClient.get("/catalogos/actividades-economicas");
    return response.data;
  } catch (error) {
    console.error("Error al obtener actividades económicas:", error);
    return [];
  }
}

export async function obtenerRetenciones(): Promise<any[]> {
  try {
    const response = await apiClient.get("/catalogos/retenciones");
    return response.data;
  } catch (error) {
    console.error("Error al obtener retenciones:", error);
    return [];
  }
}
