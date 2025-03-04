// src/pages/Proveedores/proveedoresTypes.ts

// Sub-interfaces
export interface TipoDocumento {
  id: number;
  nombre: string;
  abreviatura: string;
}

export interface Departamento {
  id: number;
  nombre: string;
}

export interface Ciudad {
  id: number;
  nombre: string;
}

/**
 * Interfaz para un Proveedor que el backend retorna en las respuestas
 * (similar a ProveedorResponseSchema).
 */
export interface ProveedorResponse {
  id: number;
  organizacion_id: number;

  tipo_documento_id: number;
  dv?: string | null;
  numero_documento: string;
  nombre_razon_social: string;
  email?: string | null;
  pagina_web?: string | null;

  departamento_id: number;
  ciudad_id: number;
  direccion: string;

  telefono1?: string;
  telefono2?: string;
  celular?: string;
  whatsapp?: string;

  tipos_persona_id: number;
  regimen_tributario_id: number;
  moneda_principal_id: number;
  tarifa_precios_id: number;
  actividad_economica_id?: number | null;
  forma_pago_id: number;
  retencion_id?: number | null;

  permitir_venta: boolean;
  descuento: number;
  cupo_credito: number;
  sucursal_id: number;

  observacion?: string | null;

  // Opcionalmente, departamento, ciudad, etc. 
  // Si tu backend incluye datos relacionales:
  // departamento?: { id: number; nombre: string };
  // ciudad?: { id: number; nombre: string };
}

/**
 * El payload para crear/actualizar un Proveedor (similar a ProveedorSchema).
 */
export interface ProveedorPayload {
  id?: number;
  // Subobjeto para controlar selects
  tipo_documento?: TipoDocumento; 
  numero_documento: string;
  nombre_razon_social: string;
  email?: string | null;
  pagina_web?: string;
  
  // Ubicación
  departamento?: Departamento;
  ciudad?: Ciudad;
  direccion: string;

  telefono1?: string;
  telefono2?: string;
  celular?: string;
  whatsapp?: string;

  tipos_persona_id: number;
  regimen_tributario_id: number;
  moneda_principal_id: number;
  tarifa_precios_id: number;
  forma_pago_id: number;
  permitir_venta: boolean;
  descuento?: number;
  cupo_credito?: number;
  sucursal_id: number;

  actividad_economica_id?: number | null;
  retencion_id?: number | null;
  observacion?: string;

  // DV si deseas manejarlo. 
  dv?: string | null;
}

