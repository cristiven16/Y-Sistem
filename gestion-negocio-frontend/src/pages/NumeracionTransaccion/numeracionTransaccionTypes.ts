// src/pages/NumeracionTransaccion/numeracionTransaccionTypes.ts

/**
 * Interfaz principal de Numeración de Transacción (similar a NumeracionTransaccionRead en tu backend).
 * Ajusta los campos según tu modelo real.
 */
export interface NumTransaccion {
    id: number;
    organizacion_id: number;
  
    tipo_transaccion?: string;
    nombre_personalizado: string;
    titulo_transaccion: string;
    mostrar_info_numeracion: boolean;
    separador_prefijo?: string;
    titulo_numeracion?: string;
    longitud_numeracion?: number;
    numeracion_por_defecto: boolean;
    numero_resolucion?: string;
    fecha_expedicion?: string;   // O 'Date' si tu backend maneja DateTime
    fecha_vencimiento?: string;
    prefijo?: string;
    numeracion_inicial: number;
    numeracion_final: number;
    numeracion_siguiente: number;
    total_maximo_por_transaccion?: number;
    transaccion_electronica: boolean;
  }
  
  /**
   * Para crear/actualizar la numeración (similar a NumeracionTransaccionCreate).
   */
  export interface NumTransaccionPayload {
    organizacion_id: number;
    tipo_transaccion?: string;
    nombre_personalizado: string;
    titulo_transaccion: string;
    mostrar_info_numeracion: boolean;
    separador_prefijo?: string;
    titulo_numeracion?: string;
    longitud_numeracion?: number;
    numeracion_por_defecto: boolean;
    numero_resolucion?: string;
    fecha_expedicion?: string;
    fecha_vencimiento?: string;
    prefijo?: string;
    numeracion_inicial: number;
    numeracion_final: number;
    numeracion_siguiente: number;
    total_maximo_por_transaccion?: number;
    transaccion_electronica: boolean;
  }
  
  /**
   * Para la paginación: { data, page, total_paginas, total_registros }.
   */
  export interface PaginatedNumTransacciones {
    data: NumTransaccion[];
    page: number;
    total_paginas: number;
    total_registros: number;
  }
  