// src/pages/TiendasVirtuales/tiendasvirtualesTypes.ts

/**
 * Interfaz principal de TiendaVirtual (según tu backend).
 */
export interface TiendaVirtual {
    id: number;
    organizacion_id: number;
    plataforma?: string;  // Ejemplo: "Shopify", "WooCommerce", etc.
    nombre: string;
    url?: string;
    centro_costo_id?: number;
    estado: boolean;
    // Si tu backend retorna objetos anidados (ej. centro_costo),
    // podrías agregarlos aquí: centro_costo?: { ... };
  }
  
  /**
   * Para crear o actualizar Tienda Virtual (similar a TiendaVirtualCreate).
   */
  export interface TiendaVirtualPayload {
    organizacion_id: number;
    plataforma?: string;
    nombre: string;
    url?: string;
    centro_costo_id?: number;
    estado: boolean;
  }
  
  /**
   * Para manejar la respuesta paginada:
   * { data, page, total_paginas, total_registros }
   */
  export interface PaginatedTiendasVirtuales {
    data: TiendaVirtual[];
    page: number;
    total_paginas: number;
    total_registros: number;
  }
  