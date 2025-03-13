// src/api/clientesAPI.ts
import apiClient from "./axiosConfig";
import { ClientePayload, Cliente} from "../pages/Clientes/clientesTypes";

/** 
 * Interfaces para tu paginación y respuestas.
 */
export interface PaginatedClientes<T> {
  data: T[];
  page: number;
  total_paginas: number;
  total_registros: number;
}

export interface CrearClienteResponse {
  message: string;
  id: number;
  numero_documento: string;
}

/**
 * Obtener la lista de clientes de forma paginada.
 * - El backend retorna { data, page, total_paginas, total_registros }.
 */
export async function getClientes(
  search = "",
  page = 1,
  page_size = 10
): Promise<PaginatedClientes<Cliente>> {
  const response = await apiClient.get("/clientes", {
    params: { search, page, page_size },
  });
  return response.data; 
}

/**
 * Crear un nuevo cliente (POST /clientes).
 * - Retorna { message, id, numero_documento }.
 */
export async function crearCliente(
  payload: ClientePayload
): Promise<CrearClienteResponse> {
  // Recuerda aplanar en tu formulario. 
  const response = await apiClient.post("/clientes", payload);
  return response.data;
}

/**
 * Obtener un cliente por ID (GET /clientes/{id}).
 */
export async function getClienteById(
  clienteId: number
): Promise<Cliente> {
  const response = await apiClient.get(`/clientes/${clienteId}`);
  return response.data;
}

/**
 * Actualizar (parcial) un cliente (PATCH /clientes/{id}).
 * El backend retorna el cliente actualizado.
 */
export async function actualizarCliente(
  clienteId: number,
  payload: Partial<ClientePayload>
): Promise<Cliente> {
  const response = await apiClient.patch(`/clientes/${clienteId}`, payload);
  return response.data;
}

/**
 * Eliminar cliente (DELETE /clientes/{id}).
 */
export async function deleteCliente(id: number): Promise<void> {
  await apiClient.delete(`/clientes/${id}`);
}

/* ──────────────────────────────────────────────────────────
   Catálogos (se asume que siguen vigentes)
   ──────────────────────────────────────────────────────────
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
    console.error("Error al obtener regímenes tributarios:", error);
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
    console.error("Error al obtener tarifas de precios:", error);
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

export async function obtenerVendedores(): Promise<any[]> {
  try {
    const response = await apiClient.get("/catalogos/vendedores");
    return response.data;
  } catch (error) {
    console.error("Error al obtener vendedores:", error);
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

export async function obtenerTiposMarketing(): Promise<any[]> {
  try {
    const response = await apiClient.get("/catalogos/tipos-marketing");
    return response.data;
  } catch (error) {
    console.error("Error al obtener tipos de marketing:", error);
    return [];
  }
}

export async function obtenerRutasLogisticas(): Promise<any[]> {
  try {
    const response = await apiClient.get("/catalogos/rutas-logisticas");
    return response.data;
  } catch (error) {
    console.error("Error al obtener rutas logísticas:", error);
    return [];
  }
}
