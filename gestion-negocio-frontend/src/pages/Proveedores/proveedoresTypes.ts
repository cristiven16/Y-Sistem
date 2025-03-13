// src/pages/Proveedores/proveedoresTypes.ts

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

export interface ProveedorResponse {
  id: number;
  organizacion_id: number;
  tipo_documento_id: number;
  dv?: string;
  numero_documento: string;
  nombre_razon_social: string;
  email?: string;
  pagina_web?: string;

  departamento_id: number;
  departamento?: { id: number; nombre: string };

  ciudad_id: number;
  ciudad?: { id: number; nombre: string };
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
  descuento: number;
  cupo_credito: number;

  sucursal_id: number;
  actividad_economica_id?: number;
  retencion_id?: number;
  observacion?: string;

  // Si el backend retorna algo adicional (cxc?), lo agregas:
  cxc?: number;

  tipo_documento?: {
    id: number;
    nombre: string;
    abreviatura: string;
  };
}

// Interfaz para crear/actualizar (Payload)
export interface ProveedorPayload {
  organizacion_id: number;
  tipo_documento?: TipoDocumento;
  tipo_documento_id?: number;

  numero_documento: string;
  nombre_razon_social: string;
  email?: string;
  pagina_web?: string;

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
  descuento: number;
  cupo_credito: number;

  sucursal_id: number;
  actividad_economica_id?: number;
  retencion_id?: number;
  observacion?: string;
  dv?: string;
}
