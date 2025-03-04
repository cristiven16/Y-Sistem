// src/api/cajasAPI.ts
import apiClient from "./axiosConfig";

/** Interfaz de Caja (coincide con CajaRead en tu backend). */
export interface Caja {
  id: number;
  organizacion_id: number;
  sucursal_id: number;
  nombre: string;
  estado: boolean;
  vigencia: boolean;
  // Opcionalmente, si tu backend retorna la relación con sucursal:
  // sucursal?: { id: number; nombre: string };
}

/** Interfaz para crear/actualizar una Caja (similar a CajaCreate). */
export interface CajaPayload {
  organizacion_id: number;
  sucursal_id: number;
  nombre: string;
  estado: boolean;
  vigencia: boolean;
}


export interface PaginatedCajas {
  data: Caja[];
  page: number;
  total_paginas: number;
  total_registros: number;
}

export async function getCajas(
  orgId: number,
  search = "",
  page = 1,
  page_size = 10
): Promise<PaginatedCajas> {
  const response = await apiClient.get(`/organizations/${orgId}/cajas`, {
    params: { search, page, page_size },
  });
  return response.data; // { data, page, total_paginas, total_registros }
}


/**
 * Crear una nueva caja (POST /organizations/{orgId}/cajas).
 * Se requiere payload con `organizacion_id = orgId`.
 */
export async function crearCaja(
  orgId: number,
  payload: CajaPayload
): Promise<Caja> {
  const response = await apiClient.post(
    `/organizations/${orgId}/cajas`,
    payload
  );
  return response.data;
}

/**
 * Obtener una caja por ID (GET /organizations/{orgId}/cajas/{cajaId}).
 */
export async function getCajaById(
  orgId: number,
  cajaId: number
): Promise<Caja> {
  const response = await apiClient.get(`/organizations/${orgId}/cajas/${cajaId}`);
  return response.data;
}

/**
 * Actualizar caja (PUT /organizations/{orgId}/cajas/{cajaId}).
 * Se requiere `organizacion_id = orgId` en el payload.
 */
export async function actualizarCaja(
  orgId: number,
  cajaId: number,
  payload: CajaPayload
): Promise<Caja> {
  const response = await apiClient.put(
    `/organizations/${orgId}/cajas/${cajaId}`,
    payload
  );
  return response.data;
}

/**
 * Eliminar caja (DELETE /organizations/{orgId}/cajas/{cajaId}).
 */
export async function deleteCaja(
  orgId: number,
  cajaId: number
): Promise<{ message: string }> {
  const response = await apiClient.delete(
    `/organizations/${orgId}/cajas/${cajaId}`
  );
  return response.data;
}
