// src/pages/Permissions/permissionsTypes.ts

/**
 * Interfaz principal de Permission (similar a tu backend PermissionRead).
 */
export interface Permission {
    id: number;
    nombre: string;
    descripcion?: string | null;
  }
  
  /**
   * Para crear/actualizar un permiso (similar a PermissionCreate en backend).
   */
  export interface PermissionPayload {
    nombre: string;
    descripcion?: string | null;
  }
  
  /**
   * Para manejar paginación (si el backend retorna
   * { data, page, total_paginas, total_registros } en GET /permissions).
   */
  export interface PaginatedPermissions {
    data: Permission[];
    page: number;
    total_paginas: number;
    total_registros: number;
  }
  