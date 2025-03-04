// src/api/bodegasAPI.ts

import apiClient from "./axiosConfig";

/**
 * Interfaz básica de Bodega según tu backend
 */
export interface Bodega {
  id: number;
  organizacion_id: number;
  sucursal_id: number;
  nombre: string;
  bodega_por_defecto: boolean;
  estado: boolean;
  // Podrías tener relaciones, p.ej. sucursal?: Sucursal;
}

/**
 * Interfaz para crear/actualizar bodega
 */
export interface BodegaPayload {
  organizacion_id: number;
  sucursal_id: number;
  nombre: string;
  bodega_por_defecto: boolean;
  estado: boolean;
}

/**
 * Interfaz para la respuesta paginada del backend:
 * { data, page, total_paginas, total_registros }
 */
export interface PaginatedBodegas {
  data: Bodega[];
  page: number;
  total_paginas: number;
  total_registros: number;
}

/**
 * Obtener la lista paginada de bodegas de la organización {orgId},
 * con búsqueda y parámetros de paginación.
 *    GET /organizations/{orgId}/bodegas?search=&page=&page_size=
 */
export async function getBodegas(
  orgId: number,
  search = "",
  page = 1,
  page_size = 10
): Promise<PaginatedBodegas> {
  const response = await apiClient.get(`/organizations/${orgId}/bodegas`, {
    params: { search, page, page_size },
  });
  return response.data; // { data, page, total_paginas, total_registros }
}

/**
 * Crear una nueva bodega
 *  (POST /organizations/{orgId}/bodegas).
 */
export async function crearBodega(
  orgId: number,
  payload: BodegaPayload
): Promise<Bodega> {
  const response = await apiClient.post(
    `/organizations/${orgId}/bodegas`,
    payload
  );
  return response.data; // Devuelve la Bodega creada
}

/**
 * Obtener una bodega por ID
 *  (GET /organizations/{orgId}/bodegas/{bodegaId}).
 */
export async function getBodegaById(
  orgId: number,
  bodegaId: number
): Promise<Bodega> {
  const response = await apiClient.get(
    `/organizations/${orgId}/bodegas/${bodegaId}`
  );
  return response.data;
}

/**
 * Actualizar bodega
 *  (PUT /organizations/{orgId}/bodegas/{bodegaId}).
 */
export async function actualizarBodega(
  orgId: number,
  bodegaId: number,
  payload: BodegaPayload
): Promise<Bodega> {
  const response = await apiClient.put(
    `/organizations/${orgId}/bodegas/${bodegaId}`,
    payload
  );
  return response.data;
}

/**
 * Eliminar bodega
 *  (DELETE /organizations/{orgId}/bodegas/{bodegaId}).
 */
export async function deleteBodega(
  orgId: number,
  bodegaId: number
): Promise<{ message: string }> {
  const response = await apiClient.delete(
    `/organizations/${orgId}/bodegas/${bodegaId}`
  );
  return response.data; // { message: "...éxito" }
}
