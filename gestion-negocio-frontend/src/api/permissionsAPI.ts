// gestion-negocio-frontend/src/api/permissionsAPI.ts

import apiClient from "./axiosConfig";
import {
  Permission,
  PermissionPayload,
  PaginatedPermissions,
} from "../pages/Permissions/permissionsTypes";

/**
 * Obtener lista paginada de permisos => GET /permissions
 * con búsqueda (search) y paginación (page, page_size).
 */
export async function getPermissions(
  search = "",
  page = 1,
  page_size = 10
): Promise<PaginatedPermissions> {
  // Ajusta si el backend usa otros nombres de query params
  const response = await apiClient.get("/permissions", {
    params: { search, page, page_size },
  });
  return response.data; // { data, page, total_paginas, total_registros }
}

/**
 * Crear un nuevo permiso => POST /permissions
 */
export async function createPermission(
  payload: PermissionPayload
): Promise<Permission> {
  const response = await apiClient.post("/permissions", payload);
  return response.data; // Retorna el Permission creado
}

/**
 * Obtener un permiso por ID => GET /permissions/{permId}
 */
export async function getPermissionById(permId: number): Promise<Permission> {
  const response = await apiClient.get(`/permissions/${permId}`);
  return response.data;
}

/**
 * Actualizar un permiso => PUT /permissions/{permId}
 */
export async function updatePermission(
  permId: number,
  payload: PermissionPayload
): Promise<Permission> {
  const response = await apiClient.put(`/permissions/${permId}`, payload);
  return response.data;
}

/**
 * Eliminar un permiso => DELETE /permissions/{permId}
 * Retorna { message: string } en tu backend
 */
export async function deletePermission(
  permId: number
): Promise<{ message: string }> {
  const response = await apiClient.delete(`/permissions/${permId}`);
  return response.data;
}
