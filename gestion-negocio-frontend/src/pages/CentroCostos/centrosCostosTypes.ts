// src/pages/CentrosCostos/centrosCostosTypes.ts

/**
 * Interfaz que coincide con el "CentroCostoRead" del backend
 */
export interface CentroCosto {
    id: number;
    organizacion_id: number;
    codigo: string;
    nombre: string;
    // Ahora nivel puede ser "PRINCIPAL", "SUBCENTRO" o null
    nivel: "PRINCIPAL" | "SUBCENTRO" | null;
    padre_id: number | null;
    permite_ingresos: boolean;
    estado: boolean;
    // Si anidas el padre, lo pones aquí
    // padre?: { id: number; codigo: string; nombre: string; ... };
  }
  
  /**
   * Interfaz para crear/actualizar un centro de costo (similar a CentroCostoCreate).
   */
  export interface CentroCostoPayload {
    organizacion_id: number;
    codigo: string;
    nombre: string;
    // Debe coincidir con "PRINCIPAL" | "SUBCENTRO" | null
    nivel: "PRINCIPAL" | "SUBCENTRO" | null;
    padre_id?: number | null;
    permite_ingresos: boolean;
    estado: boolean;
  }
  