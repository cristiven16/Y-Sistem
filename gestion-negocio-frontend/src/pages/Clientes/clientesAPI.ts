// src/pages/Clientes/clientesAPI.ts

import axios from "axios";
import { Cliente, ClientePayload } from "./clientesTypes";

const API_URL = "http://localhost:8000"; // Ajusta según tu configuración real

/**
 * Obtener la lista de clientes, con filtro opcional `search`
 */
export const getClientes = async (search: string = ""): Promise<Cliente[]> => {
  try {
    const response = await axios.get(`${API_URL}/clientes`, {
      params: { search },
    });
    // El backend devuelve un array de clientes según tu schemas/clientes.py
    return response.data;
  } catch (error) {
    console.error("Error al obtener clientes:", error);
    throw error;
  }
};

/**
 * Crear un nuevo cliente (POST /clientes)
 * El backend retorna { message, id, numero_documento } si tiene éxito
 */
export const crearCliente = async (payload: ClientePayload): Promise<any> => {
  try {
    const response = await axios.post(`${API_URL}/clientes`, payload);
    return response.data; 
  } catch (error) {
    console.error("Error al crear cliente:", error);
    throw error;
  }
};

/**
 * Actualizar cliente existente (PUT /clientes/{cliente_id})
 * Retorna el objeto cliente actualizado
 */
export const actualizarCliente = async (clienteId: number, payload: ClientePayload): Promise<any> => {
  try {
    const response = await axios.put(`${API_URL}/clientes/${clienteId}`, payload);
    return response.data; 
  } catch (error) {
    console.error("Error al actualizar cliente:", error);
    throw error;
  }
};

/**
 * Eliminar cliente (DELETE /clientes/{id})
 */
export const deleteCliente = async (id: number): Promise<void> => {
  try {
    await axios.delete(`${API_URL}/clientes/${id}`);
  } catch (error) {
    console.error("Error al eliminar cliente:", error);
    throw error;
  }
};

/* ──────────────────────────────────────────────────────────
   ████ CATÁLOGOS
   Se asume que tu backend define endpoints en /catalogos
   para cada tipo de dato. Cada uno devuelve un array.
   Ajusta los endpoints según tu backend real.
   ──────────────────────────────────────────────────────────
*/

/**
 * GET /catalogos/tipos-documento
 */
export const obtenerTiposDocumento = async (): Promise<any[]> => {
  try {
    const response = await axios.get(`${API_URL}/catalogos/tipos-documento`);
    return response.data; // [{id, nombre}, ...]
  } catch (error) {
    console.error("Error al obtener tipos de documento:", error);
    return [];
  }
};

/**
 * GET /catalogos/regimenes-tributarios
 */
export const obtenerRegimenesTributarios = async (): Promise<any[]> => {
  try {
    const response = await axios.get(`${API_URL}/catalogos/regimenes-tributarios`);
    return response.data; // [{id, nombre}, ...]
  } catch (error) {
    console.error("Error al obtener regímenes tributarios:", error);
    return [];
  }
};

/**
 * GET /catalogos/tipos-persona
 */
export const obtenerTiposPersona = async (): Promise<any[]> => {
  try {
    const response = await axios.get(`${API_URL}/catalogos/tipos-persona`);
    return response.data; // [{id, nombre}, ...]
  } catch (error) {
    console.error("Error al obtener tipos de persona:", error);
    return [];
  }
};

/**
 * GET /catalogos/monedas
 */
export const obtenerMonedas = async (): Promise<any[]> => {
  try {
    const response = await axios.get(`${API_URL}/catalogos/monedas`);
    return response.data;
  } catch (error) {
    console.error("Error al obtener monedas:", error);
    return [];
  }
};

/**
 * GET /catalogos/tarifas-precios
 */
export const obtenerTarifasPrecios = async (): Promise<any[]> => {
  try {
    const response = await axios.get(`${API_URL}/catalogos/tarifas-precios`);
    return response.data;
  } catch (error) {
    console.error("Error al obtener tarifas de precios:", error);
    return [];
  }
};

/**
 * GET /catalogos/formas-pago
 */
export const obtenerFormasPago = async (): Promise<any[]> => {
  try {
    const response = await axios.get(`${API_URL}/catalogos/formas-pago`);
    return response.data;
  } catch (error) {
    console.error("Error al obtener formas de pago:", error);
    return [];
  }
};

/**
 * GET /catalogos/sucursales
 */
export const obtenerSucursales = async (): Promise<any[]> => {
  try {
    const response = await axios.get(`${API_URL}/catalogos/sucursales`);
    return response.data;
  } catch (error) {
    console.error("Error al obtener sucursales:", error);
    return [];
  }
};

/**
 * GET /catalogos/vendedores
 */
export const obtenerVendedores = async (): Promise<any[]> => {
  try {
    const response = await axios.get(`${API_URL}/catalogos/vendedores`);
    return response.data;
  } catch (error) {
    console.error("Error al obtener vendedores:", error);
    return [];
  }
};

/* Opcionales, si tu backend los tiene: 
   GET /catalogos/actividades-economicas
   GET /catalogos/retenciones
   GET /catalogos/tipos-marketing
   GET /catalogos/rutas-logisticas
*/

/**
 * GET /catalogos/actividades-economicas
 */
export const obtenerActividadesEconomicas = async (): Promise<any[]> => {
  try {
    const response = await axios.get(`${API_URL}/catalogos/actividades-economicas`);
    return response.data;
  } catch (error) {
    console.error("Error al obtener actividades económicas:", error);
    return [];
  }
};

/**
 * GET /catalogos/retenciones
 */
export const obtenerRetenciones = async (): Promise<any[]> => {
  try {
    const response = await axios.get(`${API_URL}/catalogos/retenciones`);
    return response.data;
  } catch (error) {
    console.error("Error al obtener retenciones:", error);
    return [];
  }
};

/**
 * GET /catalogos/tipos-marketing
 */
export const obtenerTiposMarketing = async (): Promise<any[]> => {
  try {
    const response = await axios.get(`${API_URL}/catalogos/tipos-marketing`);
    return response.data;
  } catch (error) {
    console.error("Error al obtener tipos de marketing:", error);
    return [];
  }
};

/**
 * GET /catalogos/rutas-logisticas
 */
export const obtenerRutasLogisticas = async (): Promise<any[]> => {
  try {
    const response = await axios.get(`${API_URL}/catalogos/rutas-logisticas`);
    return response.data;
  } catch (error) {
    console.error("Error al obtener rutas logísticas:", error);
    return [];
  }
};

