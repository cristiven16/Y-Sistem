// src/pages/Bodegas/bodegasTypes.ts

/**
 * Interfaz principal de Bodega (según tu backend).
 */
export interface Bodega {
    id: number;
    organizacion_id: number;
    sucursal_id: number;
    nombre: string;
    bodega_por_defecto: boolean;
    estado: boolean;
    sucursal?: {
      id: number;
      nombre: string;
      // Puedes añadir más campos si el backend los retorna
    };
    // Opcionalmente, si tu backend retorna la sucursal completa:
    // sucursal?: { id: number; nombre: string; /* ... */ };
  }
  
  /**
   * Para crear o actualizar Bodega (simil a BodegaCreate).
   */
  export interface BodegaPayload {
    organizacion_id: number;
    sucursal_id: number;
    nombre: string;
    bodega_por_defecto: boolean;
    estado: boolean;
  }
  
  /**
   * Para manejar paginación (si tu backend ahora retorna 
   * { data, page, total_paginas, total_registros }).
   */
  export interface PaginatedBodegas {
    data: Bodega[];
    page: number;
    total_paginas: number;
    total_registros: number;
  }
  