// src/pages/Sucursales/sucursalesTypes.ts

// Interfaces de Departamentos y Ciudades (o reusa si ya las tienes)
export interface Departamento {
    id: number;
    nombre: string;
  }
  
  export interface Ciudad {
    id: number;
    nombre: string;
  }
  
  // Interfaz de Sucursal
  export interface Sucursal {
    id: number;
    organizacion_id: number;   // O si no lo maneja, ajusta
    nombre: string;
    pais?: string;
    departamento_id?: number | null;
    ciudad_id?: number | null;
    direccion?: string | null;
    telefonos?: string | null;
    prefijo_transacciones?: string | null;
    sucursal_principal: boolean;
    activa: boolean;
    // Si tu backend retorna las relaciones
    departamento?: Departamento; 
    ciudad?: Ciudad;
  }
  
  // Para crear/editar Sucursal
  export interface SucursalPayload {
    organizacion_id: number;
    nombre: string;
    pais?: string;
    departamento_id?: number | null;
    ciudad_id?: number | null;
    direccion?: string | null;
    telefonos?: string | null;
    prefijo_transacciones?: string | null;
    sucursal_principal: boolean;
    activa: boolean;
  }
  
  // Para la paginación
  export interface PaginatedSucursales {
    data: Sucursal[];
    page: number;
    total_paginas: number;
    total_registros: number;
  }
  