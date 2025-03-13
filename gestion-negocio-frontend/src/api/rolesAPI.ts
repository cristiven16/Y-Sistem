// gestion-negocio-frontend/src/api/rolesAPI.ts

import apiClient from "./axiosConfig";
import { Permission } from "../pages/Permissions/permissionsTypes"; 
// ^ Importa la interfaz Permission si deseas mostrar la lista de permisos de un rol
//   o puedes redefinirla localmente si prefieres.

export interface Role {
  id: number;
  organizacion_id?: number | null;
  nombre: string;
  descripcion?: string | null;
  nivel?: number; // si en tu backend role tiene campo "nivel"
}

export interface RolePayload {
  nombre: string;
  descripcion?: string | null;
  organizacion_id?: number | null; 
  nivel?: number;  // si usas 'nivel' en tu RoleCreate
}

export interface PaginatedRoles {
  data: Role[];
  page: number;
  total_paginas: number;
  total_registros: number;
}

/**
 * Listar roles con paginación y búsqueda => GET /roles?search=&page=&page_size=
 */
export async function getRoles(
  search = "",
  page = 1,
  page_size = 10
): Promise<PaginatedRoles> {
  const response = await apiClient.get("/roles", {
    params: { search, page, page_size },
  });
  return response.data;
}

/**
 * Crear un nuevo rol => POST /roles
 */
export async function createRole(payload: RolePayload): Promise<Role> {
  const response = await apiClient.post("/roles", payload);
  return response.data;
}

/**
 * Obtener un rol por ID => GET /roles/{roleId}
 */
export async function getRoleById(roleId: number): Promise<Role> {
  const response = await apiClient.get(`/roles/${roleId}`);
  return response.data;
}

/**
 * Actualizar un rol => PUT /roles/{roleId}
 */
export async function updateRole(
  roleId: number,
  payload: RolePayload
): Promise<Role> {
  const response = await apiClient.put(`/roles/${roleId}`, payload);
  return response.data;
}

/**
 * Eliminar un rol => DELETE /roles/{roleId}
 * Retorna { message: string }
 */
export async function deleteRole(
  roleId: number
): Promise<{ message: string }> {
  const response = await apiClient.delete(`/roles/${roleId}`);
  return response.data;
}

/**
 * OBTENER PERMISOS de un rol => GET /roles/{roleId}/permissions
 * Retorna un array de Permission[] (si tu backend lo hace así)
 */
export async function getRolePermissions(roleId: number): Promise<Permission[]> {
  const response = await apiClient.get(`/roles/${roleId}/permissions`);
  return response.data; // un array de permisos
}

/**
 * ASIGNAR un permiso a un rol => POST /roles/{roleId}/permissions/{permId}
 * Retorna { message: string }
 */
export async function assignPermissionToRole(
  roleId: number,
  permId: number
): Promise<{ message: string }> {
  const response = await apiClient.post(`/roles/${roleId}/permissions/${permId}`);
  return response.data;
}

/**
 * QUITAR un permiso de un rol => DELETE /roles/{roleId}/permissions/{permId}
 * Retorna { message: string }
 */
export async function removePermissionFromRole(
  roleId: number,
  permId: number
): Promise<{ message: string }> {
  const response = await apiClient.delete(`/roles/${roleId}/permissions/${permId}`);
  return response.data;
}
