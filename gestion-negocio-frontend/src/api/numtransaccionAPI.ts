// src/api/numtransaccionAPI.ts

import apiClient from "./axiosConfig";

/**
 * Interfaz que coincide con NumeracionTransaccionRead en tu backend.
 * Ajusta las propiedades según tu modelo/endpoint real.
 */
export interface NumTransaccion {
  id: number;
  organizacion_id: number;

  tipo_transaccion?: string;
  nombre_personalizado: string;
  titulo_transaccion: string;
  mostrar_info_numeracion: boolean;
  separador_prefijo?: string;
  titulo_numeracion?: string;
  longitud_numeracion?: number;
  numeracion_por_defecto: boolean;
  numero_resolucion?: string;
  fecha_expedicion?: string;   // Si tu backend maneja DateTime, aquí lo verás como string
  fecha_vencimiento?: string;
  prefijo?: string;
  numeracion_inicial: number;
  numeracion_final: number;
  numeracion_siguiente: number;
  total_maximo_por_transaccion?: number;
  transaccion_electronica: boolean;

  // Si tenías sucursal_id u otros campos, agrégalos aquí
  // sucursal_id?: number;
  // sucursal?: { id: number; nombre: string };
}

/**
 * Interfaz para crear/actualizar (NumeracionTransaccionCreate).
 * Ajusta si tu backend pide menos/más campos en el POST/PUT.
 */
export interface NumTransaccionPayload {
  organizacion_id: number;
  tipo_transaccion?: string;
  nombre_personalizado: string;
  titulo_transaccion: string;
  mostrar_info_numeracion: boolean;
  separador_prefijo?: string;
  titulo_numeracion?: string;
  longitud_numeracion?: number;
  numeracion_por_defecto: boolean;
  numero_resolucion?: string;
  fecha_expedicion?: string;
  fecha_vencimiento?: string;
  prefijo?: string;
  numeracion_inicial: number;
  numeracion_final: number;
  numeracion_siguiente: number;
  total_maximo_por_transaccion?: number;
  transaccion_electronica: boolean;
  // Si no asocias a sucursal, no incluyes 'sucursal_id'
}

/**
 * Interfaz para la respuesta paginada:
 * { data, page, total_paginas, total_registros }
 */
export interface PaginatedNumTransacciones {
  data: NumTransaccion[];
  page: number;
  total_paginas: number;
  total_registros: number;
}

/**
 * GET /organizations/{orgId}/numeraciones
 * con ?search=&page=&page_size=
 */
export async function getNumTransacciones(
  orgId: number,
  search = "",
  page = 1,
  page_size = 10
): Promise<PaginatedNumTransacciones> {
  const response = await apiClient.get(`/organizations/${orgId}/numeraciones`, {
    params: { search, page, page_size },
  });
  return response.data; // { data, page, total_paginas, total_registros }
}

/**
 * POST /organizations/{orgId}/numeraciones
 * Crea una nueva numeración de transacción
 */
export async function crearNumTransaccion(
  orgId: number,
  payload: NumTransaccionPayload
): Promise<NumTransaccion> {
  const response = await apiClient.post(
    `/organizations/${orgId}/numeraciones`,
    payload
  );
  return response.data; // Devuelve la numeración creada
}

/**
 * GET /organizations/{orgId}/numeraciones/{numId}
 * Obtener una numeración por ID
 */
export async function getNumTransaccionById(
  orgId: number,
  numId: number
): Promise<NumTransaccion> {
  const response = await apiClient.get(
    `/organizations/${orgId}/numeraciones/${numId}`
  );
  return response.data;
}

/**
 * PUT /organizations/{orgId}/numeraciones/{numId}
 * Actualizar una numeración
 */
export async function actualizarNumTransaccion(
  orgId: number,
  numId: number,
  payload: NumTransaccionPayload
): Promise<NumTransaccion> {
  const response = await apiClient.put(
    `/organizations/${orgId}/numeraciones/${numId}`,
    payload
  );
  return response.data;
}

/**
 * DELETE /organizations/{orgId}/numeraciones/{numId}
 * Eliminar una numeración de transacción
 */
export async function deleteNumTransaccion(
  orgId: number,
  numId: number
): Promise<{ message: string }> {
  const response = await apiClient.delete(
    `/organizations/${orgId}/numeraciones/${numId}`
  );
  return response.data; // { message: "...éxito" }
}
