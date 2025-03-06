// src/api/centrocostosAPI.ts

import apiClient from "./axiosConfig";

/** Interfaz de Centro de Costo (debe coincidir con CentroCostoRead en el backend). */
export interface CentroCosto {
  id: number;
  organizacion_id: number;
  codigo: string;
  nombre: string;
  nivel: number;
  padre_id: number | null;
  permite_ingresos: boolean;
  estado: boolean;
  // Si en el futuro quieres anidar el 'padre' con { id, codigo, nombre, ... },
  // podrías agregar algo como: padre?: { id: number; codigo: string; ... };
}

/** Interfaz para crear/actualizar un Centro de Costo (similar a CentroCostoCreate en tu backend). */
export interface CentroCostoPayload {
  organizacion_id: number;
  codigo: string;
  nombre: string;
  nivel: number;
  padre_id?: number | null;
  permite_ingresos: boolean;
  estado: boolean;
}

/** Interfaz para la respuesta paginada (coincide con PaginatedCentrosCostos en backend). */
export interface PaginatedCentrosCostos {
  data: CentroCosto[];
  page: number;
  total_paginas: number;
  total_registros: number;
}

/**
 * Obtener la lista paginada de Centros de Costo.
 * GET /organizations/{orgId}/centros_costos?search=&page=&page_size=
 */
export async function getCentrosCostos(
  orgId: number,
  search = "",
  page = 1,
  page_size = 10
): Promise<PaginatedCentrosCostos> {
  const response = await apiClient.get(`/organizations/${orgId}/centros_costos`, {
    params: { search, page, page_size },
  });
  return response.data; // { data, page, total_paginas, total_registros }
}

/**
 * Crear un nuevo Centro de Costo.
 * POST /organizations/{orgId}/centros_costos
 * Se requiere payload con `organizacion_id = orgId`.
 */
export async function crearCentroCosto(
  orgId: number,
  payload: CentroCostoPayload
): Promise<CentroCosto> {
  const response = await apiClient.post(
    `/organizations/${orgId}/centros_costos`,
    payload
  );
  return response.data;
}

/**
 * Obtener un Centro de Costo por ID.
 * GET /organizations/{orgId}/centros_costos/{centroId}
 */
export async function getCentroCostoById(
  orgId: number,
  centroId: number
): Promise<CentroCosto> {
  const response = await apiClient.get(`/organizations/${orgId}/centros_costos/${centroId}`);
  return response.data;
}

/**
 * Actualizar un Centro de Costo.
 * PUT /organizations/{orgId}/centros_costos/{centroId}
 * Se requiere `organizacion_id = orgId` en el payload.
 */
export async function actualizarCentroCosto(
  orgId: number,
  centroId: number,
  payload: CentroCostoPayload
): Promise<CentroCosto> {
  const response = await apiClient.put(
    `/organizations/${orgId}/centros_costos/${centroId}`,
    payload
  );
  return response.data;
}

/**
 * Eliminar un Centro de Costo.
 * DELETE /organizations/{orgId}/centros_costos/{centroId}
 */
export async function deleteCentroCosto(
  orgId: number,
  centroId: number
): Promise<{ message: string }> {
  const response = await apiClient.delete(
    `/organizations/${orgId}/centros_costos/${centroId}`
  );
  return response.data;
}
