// src/pages/Roles/rolesTypes.ts

/**
 * Si prefieres reusar la misma interfaz que en rolesAPI, 
 * podrías hacer un import { Role, RolePayload } from "../../api/rolesAPI";
 * pero a veces uno define las suyas. Suelen ser iguales.
 */

export interface Role {
  id: number;
  organizacion_id?: number | null;
  nombre: string;
  descripcion?: string | null;
  // nivel?: number; // si tu backend define "nivel"
}

export interface RolePayload {
  nombre: string;
  descripcion?: string | null;
  organizacion_id?: number | null;
  // nivel?: number;
}

export interface PaginatedRoles {
  data: Role[];
  page: number;
  total_paginas: number;
  total_registros: number;
}
