// src/pages/Cajas/cajasTypes.ts

/** Si usas la interfaz de Caja que ya definiste en api/cajasAPI,
    podrías re-exportarla aquí, o extenderla con otras props (relaciones).
 */
    export interface Caja {
        id: number;
        organizacion_id: number;
        sucursal_id: number;
        nombre: string;
        estado: boolean;
        vigencia: boolean;
        // sucursal?: { id: number; nombre: string }; // opcional
      }
      
      /** Payload para crear/actualizar */
      export interface CajaPayload {
        organizacion_id: number;
        sucursal_id: number;
        nombre: string;
        estado: boolean;
        vigencia: boolean;
      }
      