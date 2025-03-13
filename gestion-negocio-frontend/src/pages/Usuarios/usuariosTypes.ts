// src/pages/Usuarios/usuariosTypes.ts

/**
 * Posibles estados del usuario (enum en tu backend).
 */
export type EstadoUsuario = "activo" | "bloqueado" | "inactivo";

/**
 * Interfaz principal de Usuario (similar a UserRead en tu backend).
 */
export interface Usuario {
  id: number;
  nombre: string;
  email: string;
  rol_id?: number | null;
  organizacion_id?: number | null;
  estado: EstadoUsuario;
  tiene_mfa?: boolean;
  // si tu backend retorna más campos (fecha_creacion, etc.), agrégalos
}

/**
 * Para crear un usuario (similar a UserCreate).
 * El backend requiere 'password', 'email', 'nombre'.
 */
export interface UsuarioCreatePayload {
  nombre: string;
  email: string;
  password: string;
  rol_id?: number | null;
  organizacion_id?: number | null;
  // estado se suele setear en el backend como "activo" por defecto
}

/**
 * Para actualizar un usuario de forma parcial (similar a UserUpdate).
 */
export interface UsuarioUpdatePayload {
  nombre?: string;
  email?: string;
  password?: string;
  rol_id?: number | null;
  organizacion_id?: number | null;
  estado?: EstadoUsuario; 
}

/**
 * Para la respuesta paginada: { data: Usuario[], page, total_paginas, total_registros }
 */
export interface PaginatedUsuarios {
  data: Usuario[];
  page: number;
  total_paginas: number;
  total_registros: number;
}
