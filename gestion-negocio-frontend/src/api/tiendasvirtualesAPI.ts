// src/api/tiendasvirtualesAPI.ts

import apiClient from "./axiosConfig";

/** Interfaz de Tienda Virtual (coincide con TiendaVirtualRead en el backend). */
export interface TiendaVirtual {
  id: number;
  organizacion_id: number;
  plataforma?: string;
  nombre: string;
  url?: string;
  centro_costo_id?: number;
  estado: boolean;
  // Si tu backend anida un objeto 'centro_costo' u otros, agrégalo aquí
  // centro_costo?: { id: number; nombre: string };
}

/** Interfaz para crear/actualizar Tienda Virtual (similar a TiendaVirtualCreate). */
export interface TiendaVirtualPayload {
  organizacion_id: number;
  plataforma?: string;
  nombre: string;
  url?: string;
  centro_costo_id?: number;
  estado: boolean;
}

/** Interfaz para la respuesta paginada:
 *  { data, page, total_paginas, total_registros }
 */
export interface PaginatedTiendasVirtuales {
  data: TiendaVirtual[];
  page: number;
  total_paginas: number;
  total_registros: number;
}

/**
 * Obtener la lista paginada de Tiendas Virtuales de la org {orgId},
 * con búsqueda y paginación:
 *   GET /organizations/{orgId}/tiendas_virtuales?search=&page=&page_size=
 */
export async function getTiendasVirtuales(
  orgId: number,
  search = "",
  page = 1,
  page_size = 10
): Promise<PaginatedTiendasVirtuales> {
  const response = await apiClient.get(`/organizations/${orgId}/tiendas_virtuales`, {
    params: { search, page, page_size },
  });
  return response.data; // { data, page, total_paginas, total_registros }
}

/**
 * Crear una nueva Tienda Virtual
 *   POST /organizations/{orgId}/tiendas_virtuales
 */
export async function crearTiendaVirtual(
  orgId: number,
  payload: TiendaVirtualPayload
): Promise<TiendaVirtual> {
  const response = await apiClient.post(
    `/organizations/${orgId}/tiendas_virtuales`,
    payload
  );
  return response.data; // Retorna la Tienda Virtual creada
}

/**
 * Obtener una Tienda Virtual por ID
 *   GET /organizations/{orgId}/tiendas_virtuales/{tiendaId}
 */
export async function getTiendaVirtualById(
  orgId: number,
  tiendaId: number
): Promise<TiendaVirtual> {
  const response = await apiClient.get(
    `/organizations/${orgId}/tiendas_virtuales/${tiendaId}`
  );
  return response.data;
}

/**
 * Actualizar Tienda Virtual
 *   PUT /organizations/{orgId}/tiendas_virtuales/{tiendaId}
 */
export async function actualizarTiendaVirtual(
  orgId: number,
  tiendaId: number,
  payload: TiendaVirtualPayload
): Promise<TiendaVirtual> {
  const response = await apiClient.put(
    `/organizations/${orgId}/tiendas_virtuales/${tiendaId}`,
    payload
  );
  return response.data;
}

/**
 * Eliminar Tienda Virtual
 *   DELETE /organizations/{orgId}/tiendas_virtuales/{tiendaId}
 */
export async function deleteTiendaVirtual(
  orgId: number,
  tiendaId: number
): Promise<{ message: string }> {
  const response = await apiClient.delete(
    `/organizations/${orgId}/tiendas_virtuales/${tiendaId}`
  );
  return response.data; // { message: "...éxito" }
}
