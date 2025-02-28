// src/api/proveedoresAPI.ts

import axios from "axios";
import { API_BASE_URL } from "./config"; // Reemplaza "./config" con la ruta real donde está tu archivo config.ts
import { Proveedor, ProveedorPayload } from "../pages/Proveedores/proveedoresTypes";

// 1) URL base para el módulo de Proveedores
const PROVEEDORES_URL = `${API_BASE_URL}/proveedores`;

/**
 * Obtener la lista de proveedores.
 * Si tu backend maneja paginación y búsqueda, ajusta params.
 */
export const getProveedores = async (search: string = ""): Promise<Proveedor[]> => {
  try {
    // Suponiendo que tu backend admite '?search=...' 
    // y retorna un array o un objeto paginado { data, page, ... }
    const response = await axios.get(PROVEEDORES_URL, {
      params: { search },
    });
    // Si tu backend responde con { data, page, total_paginas, ... }
    // return response.data.data;
    // De lo contrario, si devuelve un array directo:
    return response.data;
  } catch (error) {
    console.error("Error al obtener proveedores:", error);
    throw error;
  }
};

/**
 * Crear un nuevo proveedor (POST /proveedores)
 */
export const crearProveedor = async (payload: ProveedorPayload): Promise<any> => {
  try {
    const response = await axios.post(PROVEEDORES_URL, payload);
    return response.data; // ejemplo: { message: "Proveedor creado", id, ... }
  } catch (error) {
    console.error("Error al crear proveedor:", error);
    throw error;
  }
};

/**
 * Actualizar proveedor (PUT /proveedores/{id})
 */
export const actualizarProveedor = async (
  proveedorId: number,
  payload: ProveedorPayload
): Promise<any> => {
  try {
    const response = await axios.put(`${PROVEEDORES_URL}/${proveedorId}`, payload);
    return response.data; // ejemplo: ProveedorResponseSchema
  } catch (error) {
    console.error("Error al actualizar proveedor:", error);
    throw error;
  }
};

/**
 * Eliminar proveedor (DELETE /proveedores/{id})
 */
export const deleteProveedor = async (id: number): Promise<void> => {
  try {
    await axios.delete(`${PROVEEDORES_URL}/${id}`);
  } catch (error) {
    console.error("Error al eliminar proveedor:", error);
    throw error;
  }
};

/* 
  ─────────────────────────────────────────────────────
  ████ CATÁLOGOS 
  Si tu backend tiene endpoints para catálogos de tipos de doc, 
  regimen, etc., y los define bajo /catalogos/..., 
  úsalos desde la base 'API_BASE_URL'. 
  ─────────────────────────────────────────────────────
*/

/**
 * GET /catalogos/tipos-documento
 */
export const obtenerTiposDocumento = async (): Promise<any[]> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/catalogos/tipos-documento`);
    return response.data; // [{id, nombre, abreviatura}, ...]
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
    const response = await axios.get(`${API_BASE_URL}/catalogos/regimenes-tributarios`);
    return response.data;
  } catch (error) {
    console.error("Error al obtener regimenes tributarios:", error);
    return [];
  }
};

/**
 * GET /catalogos/tipos-persona
 */
export const obtenerTiposPersona = async (): Promise<any[]> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/catalogos/tipos-persona`);
    return response.data;
  } catch (error) {
    console.error("Error al obtener tipos persona:", error);
    return [];
  }
};

/**
 * GET /catalogos/monedas
 */
export const obtenerMonedas = async (): Promise<any[]> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/catalogos/monedas`);
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
    const response = await axios.get(`${API_BASE_URL}/catalogos/tarifas-precios`);
    return response.data;
  } catch (error) {
    console.error("Error al obtener tarifas precios:", error);
    return [];
  }
};

/**
 * GET /catalogos/formas-pago
 */
export const obtenerFormasPago = async (): Promise<any[]> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/catalogos/formas-pago`);
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
    const response = await axios.get(`${API_BASE_URL}/catalogos/sucursales`);
    return response.data;
  } catch (error) {
    console.error("Error al obtener sucursales:", error);
    return [];
  }
};

/**
 * GET /catalogos/actividades-economicas
 */
export const obtenerActividadesEconomicas = async (): Promise<any[]> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/catalogos/actividades-economicas`);
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
    const response = await axios.get(`${API_BASE_URL}/catalogos/retenciones`);
    return response.data;
  } catch (error) {
    console.error("Error al obtener retenciones:", error);
    return [];
  }
};

/**
 * Otros catálogos si tu backend los define: 
 * /catalogos/tipos-marketing, /catalogos/rutas-logisticas, etc.
 */
