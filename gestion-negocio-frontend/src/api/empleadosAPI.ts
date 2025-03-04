// src/api/empleadosAPI.ts

import apiClient from "./axiosConfig";

/** 
 * Si deseas tipar la respuesta paginada, define una interfaz 
 * (usando la misma estructura del backend):
 */
export interface Empleado {
  id: number;
  organizacion_id: number;
  tipo_documento_id: number;
  dv?: string;
  numero_documento: string;
  nombre_razon_social: string;
  email?: string;
  telefono1?: string;
  telefono2?: string;
  celular?: string;
  whatsapp?: string;
  tipos_persona_id: number;
  regimen_tributario_id: number;
  moneda_principal_id: number;
  actividad_economica_id?: number;
  forma_pago_id: number;
  retencion_id?: number;
  departamento_id: number;
  ciudad_id: number;
  direccion: string;
  sucursal_id: number;
  cargo?: string;
  fecha_nacimiento?: string;  // o Date, si lo manejas así
  fecha_ingreso?: string;     // o Date
  activo: boolean;
  es_vendedor: boolean;
  observacion?: string;
  // ...y cualquier otro campo que tu backend incluya
}

export interface PaginatedEmpleados {
  data: Empleado[];
  page: number;
  total_paginas: number;
  total_registros: number;
}

// Para la creación/actualización, podrías tener un payload tipo:
export interface EmpleadoPayload {
  organizacion_id: number;
  tipo_documento_id: number;
  numero_documento: string;
  nombre_razon_social: string;
  email?: string | null;
  telefono1?: string;
  telefono2?: string;
  celular?: string;
  whatsapp?: string;
  tipos_persona_id: number;
  regimen_tributario_id: number;
  moneda_principal_id: number;
  actividad_economica_id?: number;
  forma_pago_id: number;
  retencion_id?: number;
  departamento_id: number;
  ciudad_id: number;
  direccion: string;
  sucursal_id: number;
  cargo?: string;
  fecha_nacimiento?: string;
  fecha_ingreso?: string;
  activo: boolean;
  es_vendedor: boolean;
  observacion?: string;
  // El DV lo calcula el backend si es NIT
}

/**
 * Obtener lista paginada de Empleados (GET /empleados).
 * Retorna { data, page, total_paginas, total_registros }.
 */
export async function obtenerEmpleados(
  page = 1,
  search = "",
  esVendedor?: boolean
): Promise<PaginatedEmpleados> {
  const params: any = { page, search };
  if (esVendedor !== undefined) {
    params.es_vendedor = esVendedor;
  }
  const resp = await apiClient.get("/empleados", { params });
  return resp.data; // { data, page, total_paginas, total_registros }
}

/**
 * Crear Empleado (POST /empleados).
 * - El backend retorna { message, id, numero_documento }.
 */
export async function crearEmpleado(
  payload: EmpleadoPayload
): Promise<{ message: string; id: number; numero_documento: string }> {
  const resp = await apiClient.post("/empleados", payload);
  return resp.data;
}

/**
 * Actualizar Empleado (PUT /empleados/{id}) => actualización COMPLETA.
 * - El backend retorna EmpleadoResponseSchema (Empleado).
 */
export async function actualizarEmpleadoCompleto(
  id: number,
  payload: EmpleadoPayload
): Promise<Empleado> {
  const resp = await apiClient.put(`/empleados/${id}`, payload);
  return resp.data;
}

/**
 * Actualizar Empleado parcial (PATCH /empleados/{id}) => actualización PARCIAL.
 * - El backend retorna EmpleadoResponseSchema (Empleado).
 */
export async function actualizarEmpleadoParcial(
  id: number,
  payload: Partial<EmpleadoPayload>
): Promise<Empleado> {
  const resp = await apiClient.patch(`/empleados/${id}`, payload);
  return resp.data;
}

/**
 * Eliminar Empleado (DELETE /empleados/{id}).
 * - El backend retorna { message: "Empleado eliminado correctamente" }.
 */
export async function eliminarEmpleado(id: number): Promise<{ message: string }> {
  const resp = await apiClient.delete(`/empleados/${id}`);
  return resp.data;
}

/**
 * Obtener un Empleado por ID (GET /empleados/{id}).
 * - Retorna EmpleadoResponseSchema (Empleado).
 */
export async function obtenerEmpleadoPorId(id: number): Promise<Empleado> {
  const resp = await apiClient.get(`/empleados/${id}`);
  return resp.data;
}

/**
 * Catálogo de tipos de documento (GET /catalogos/tipos-documento).
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

/**
 * Lista de Empleados que sean vendedores (GET /empleados?es_vendedor=true).
 * El backend retorna paginado, extraemos el array data: Empleado[].
 */
export async function obtenerEmpleadosVendedores(): Promise<Empleado[]> {
  const resp = await apiClient.get("/empleados", {
    params: { es_vendedor: true },
  });
  // Si el backend retorna { data: [...], page, ... }, extraemos resp.data.data
  return resp.data.data;
}
