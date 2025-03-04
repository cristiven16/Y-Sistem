// src/api/sucursalesAPI.ts

import apiClient from "./axiosConfig";
import {
  Sucursal,
  SucursalPayload,
  PaginatedSucursales,
} from "../pages/Sucursales/sucursalesTypes";

/**
 * Obtener la lista paginada de sucursales de la organización {orgId},
 * con búsqueda opcional y parámetros de paginación.
 * 
 * GET /organizations/{orgId}/sucursales?search=&page=&page_size=
 */
export async function getSucursales(
  orgId: number,
  search = "",
  page = 1,
  page_size = 10
): Promise<PaginatedSucursales> {
  const resp = await apiClient.get(`/organizations/${orgId}/sucursales`, {
    params: { search, page, page_size },
  });
  // Respuesta: { data, page, total_paginas, total_registros }
  return resp.data;
}

/**
 * Crear nueva sucursal (POST /organizations/{orgId}/sucursales).
 * 
 * Requiere que en tu payload figure "organizacion_id = orgId" 
 * (por coherencia con el backend) y 
 * que hagas la llamada con createSucursal(orgId, payload).
 */
export async function crearSucursal(
  orgId: number,
  payload: SucursalPayload
): Promise<Sucursal> {
  const response = await apiClient.post(
    `/organizations/${orgId}/sucursales`,
    payload
  );
  return response.data; // Devuelve SucursalRead
}

/**
 * Actualizar sucursal (PATCH /organizations/{orgId}/sucursales/{sucursalId}).
 * 
 * El payload debe contener "organizacion_id = orgId" 
 * (o al menos no contradecirlo).
 */
export async function actualizarSucursalParcial(
  orgId: number,
  sucursalId: number,
  payload: Partial<SucursalPayload>
): Promise<Sucursal> {
  // Usamos PATCH
  const response = await apiClient.patch(
    `/organizations/${orgId}/sucursales/${sucursalId}`,
    payload
  );
  return response.data;
}

/**
 * Eliminar sucursal 
 * (DELETE /organizations/{orgId}/sucursales/{sucursalId}).
 */
export async function deleteSucursal(
  orgId: number,
  sucursalId: number
): Promise<void> {
  await apiClient.delete(`/organizations/${orgId}/sucursales/${sucursalId}`);
}
