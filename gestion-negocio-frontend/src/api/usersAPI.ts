// gestion-negocio-frontend/src/api/usersAPI.ts

import apiClient from "./axiosConfig";

/**
 * Posibles valores del enum EstadoUsuario según tu backend:
 *   "activo" | "bloqueado" | "inactivo".
 */
export type EstadoUsuario = "activo" | "bloqueado" | "inactivo";

/**
 * Interfaz que coincide con "UserRead" en tu backend.
 * Ajusta los campos necesarios (por ejemplo, hashed_password no se envía).
 */
export interface User {
  id: number;
  nombre: string;
  email: string;
  rol_id?: number | null;
  organizacion_id?: number | null;
  estado: EstadoUsuario;
  tiene_mfa?: boolean; 
  // Si tu backend retorna mas datos: fecha_creacion, etc., agrégalos
}

/**
 * Si en tu backend devuelves algo adicional, como 'rol_nombre',
 * puedes extender la interfaz base "User" para reflejarlo en la UI.
 */
export interface UserExtended extends User {
  rol_nombre?: string; 
  // Otras props extra que el backend retorne
}

/**
 * Para crear un usuario (similar a "UserCreate" en tu backend).
 * Requiere password, nombre, email, etc.
 */
export interface UserCreatePayload {
  nombre: string;
  email: string;
  password: string;
  rol_id?: number | null;
  organizacion_id?: number | null;
  // estado se define en backend (por defecto "activo"), 
  // o aquí si tu backend lo requiere
}

/**
 * Para actualizar un usuario de forma parcial (similar a "UserUpdate").
 * Campos opcionales, pues PATCH /users/{id} solo actualiza lo enviado.
 */
export interface UserUpdatePayload {
  nombre?: string;
  email?: string;
  password?: string;         // si se cambia la contraseña
  rol_id?: number | null;
  organizacion_id?: number | null;
  estado?: EstadoUsuario;    
}

/**
 * Estructura de paginación:
 * { data, page, total_paginas, total_registros } con la lista de usuarios.
 */
export interface PaginatedUsers {
  data: User[];
  page: number;
  total_paginas: number;
  total_registros: number;
}

/**
 * Versión con 'UserExtended' si tu backend retorna 'rol_nombre', etc.
 */
export interface PaginatedUsersExtended {
  data: UserExtended[];
  page: number;
  total_paginas: number;
  total_registros: number;
}

/**
 * Listar usuarios con paginación y búsqueda => GET /users?search=&page=&page_size=
 * (Asumiendo tu backend define este endpoint.)
 */
export async function getUsers(
  search = "",
  page = 1,
  page_size = 10
): Promise<PaginatedUsers> {
  const response = await apiClient.get("/users", {
    params: { search, page, page_size },
  });
  return response.data; // { data, page, total_paginas, total_registros }
}

/**
 * Listar usuarios por organización => GET /organizations/{orgId}/users?search=&page=&page_size=
 * (Si tu backend soporta filtrar por organizacion. Devuelve un "UserExtended"?)
 */
export async function getUsersByOrg(
  orgId: number,
  search = "",
  page = 1,
  page_size = 10
) {
  return apiClient
    .get(`/users/organizations/${orgId}/users`, { params: { search, page, page_size } })
    .then((res) => res.data);
}

/**
 * Crear un usuario => POST /users
 */
export async function createUser(payload: UserCreatePayload): Promise<User> {
  const response = await apiClient.post("/users", payload);
  return response.data;
}

/**
 * Obtener datos del usuario logueado => GET /users/me
 */
export async function getMe(): Promise<User> {
  const response = await apiClient.get("/users/me");
  return response.data;
}

/**
 * Obtener un usuario por ID => GET /users/{userId}
 */
export async function getUserById(userId: number): Promise<User> {
  const response = await apiClient.get(`/users/${userId}`);
  return response.data;
}

/**
 * Actualizar un usuario de forma parcial => PATCH /users/{userId}
 * (El backend maneja patch en lugar de put.)
 */
export async function updateUserPartial(
  userId: number,
  payload: UserUpdatePayload
): Promise<User> {
  const response = await apiClient.patch(`/users/${userId}`, payload);
  return response.data;
}

/**
 * Eliminar un usuario => DELETE /users/{userId}
 * Retorna { message: string }
 */
export async function deleteUser(userId: number): Promise<{ message: string }> {
  const response = await apiClient.delete(`/users/${userId}`);
  return response.data;
}
