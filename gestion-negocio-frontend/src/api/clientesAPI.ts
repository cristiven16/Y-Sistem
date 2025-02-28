// src/api/clientesAPI.ts
import axios from "axios";
import { API_BASE_URL } from "./config";  // Importa tu URL base
import { Cliente, ClientePayload } from "../pages/Clientes/clientesTypes";

/**
 * Endpoints de CLIENTES
 */
const CLIENTES_URL = `${API_BASE_URL}/clientes`;

/**
 * Obtener la lista de clientes
 */
export const getClientes = async (search: string = ""): Promise<Cliente[]> => {
  try {
    // Si tienes paginación, ajusta params
    const response = await axios.get(CLIENTES_URL, { params: { search } });
    // Suponiendo que el backend retorna directamente un array
    // o bien { data, page, total_paginas, etc. }
    return response.data;
  } catch (error) {
    console.error("Error al obtener clientes:", error);
    throw error;
  }
};

/**
 * Crear un nuevo cliente
 */
export const crearCliente = async (payload: ClientePayload): Promise<any> => {
  try {
    const response = await axios.post(CLIENTES_URL, payload);
    return response.data;
  } catch (error) {
    console.error("Error al crear cliente:", error);
    throw error;
  }
};

/**
 * Actualizar cliente existente
 */
export const actualizarCliente = async (
  clienteId: number,
  payload: ClientePayload
): Promise<any> => {
  try {
    const response = await axios.put(`${CLIENTES_URL}/${clienteId}`, payload);
    return response.data;
  } catch (error) {
    console.error("Error al actualizar cliente:", error);
    throw error;
  }
};

/**
 * Eliminar cliente
 */
export const deleteCliente = async (id: number): Promise<void> => {
  try {
    await axios.delete(`${CLIENTES_URL}/${id}`);
  } catch (error) {
    console.error("Error al eliminar cliente:", error);
    throw error;
  }
};

/* ──────────────────────────────────────────────────────────
   Catalogos
   ──────────────────────────────────────────────────────────
*/
export const obtenerTiposDocumento = async (): Promise<any[]> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/catalogos/tipos-documento`);
    return response.data;
  } catch (error) {
    console.error("Error al obtener tipos de documento:", error);
    return [];
  }
};

export const obtenerRegimenesTributarios = async (): Promise<any[]> => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/catalogos/regimenes-tributarios`
    );
    return response.data;
  } catch (error) {
    console.error("Error al obtener regímenes tributarios:", error);
    return [];
  }
};

export const obtenerTiposPersona = async (): Promise<any[]> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/catalogos/tipos-persona`);
    return response.data;
  } catch (error) {
    console.error("Error al obtener tipos de persona:", error);
    return [];
  }
};

export const obtenerMonedas = async (): Promise<any[]> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/catalogos/monedas`);
    return response.data;
  } catch (error) {
    console.error("Error al obtener monedas:", error);
    return [];
  }
};

export const obtenerTarifasPrecios = async (): Promise<any[]> => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/catalogos/tarifas-precios`
    );
    return response.data;
  } catch (error) {
    console.error("Error al obtener tarifas de precios:", error);
    return [];
  }
};

export const obtenerFormasPago = async (): Promise<any[]> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/catalogos/formas-pago`);
    return response.data;
  } catch (error) {
    console.error("Error al obtener formas de pago:", error);
    return [];
  }
};

export const obtenerSucursales = async (): Promise<any[]> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/catalogos/sucursales`);
    return response.data;
  } catch (error) {
    console.error("Error al obtener sucursales:", error);
    return [];
  }
};

// Vendedores
export const obtenerVendedores = async (): Promise<any[]> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/catalogos/vendedores`);
    return response.data;
  } catch (error) {
    console.error("Error al obtener vendedores:", error);
    return [];
  }
};

// Actividades económicas
export const obtenerActividadesEconomicas = async (): Promise<any[]> => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/catalogos/actividades-economicas`
    );
    return response.data;
  } catch (error) {
    console.error("Error al obtener actividades económicas:", error);
    return [];
  }
};

export const obtenerRetenciones = async (): Promise<any[]> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/catalogos/retenciones`);
    return response.data;
  } catch (error) {
    console.error("Error al obtener retenciones:", error);
    return [];
  }
};

export const obtenerTiposMarketing = async (): Promise<any[]> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/catalogos/tipos-marketing`);
    return response.data;
  } catch (error) {
    console.error("Error al obtener tipos de marketing:", error);
    return [];
  }
};

export const obtenerRutasLogisticas = async (): Promise<any[]> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/catalogos/rutas-logisticas`);
    return response.data;
  } catch (error) {
    console.error("Error al obtener rutas logísticas:", error);
    return [];
  }
};
