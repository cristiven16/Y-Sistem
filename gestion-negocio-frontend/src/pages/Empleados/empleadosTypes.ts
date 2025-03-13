// src/pages/Empleados/empleadosTypes.ts

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
  departamento_id?: number;
}

/**
 * Este es el tipo que tu backend retorna, basado en EmpleadoResponseSchema.
 * Contiene objetos relacionados (tipo_documento, departamento, ciudad) opcionalmente.
 */
export interface Empleado {
  id: number;
  organizacion_id: number;
  tipo_documento_id: number;
  tipo_documento?: TipoDocumento;

  dv?: string | undefined; // si viene calculado cuando es NIT
  numero_documento: string;
  nombre_razon_social: string;
  email?: string | undefined;

  telefono1?: string;
  telefono2?: string;
  celular?: string;
  whatsapp?: string;

  tipos_persona_id: number;
  regimen_tributario_id: number;
  moneda_principal_id: number;
  actividad_economica_id?: number | undefined;
  forma_pago_id: number;
  retencion_id?: number | undefined;

  departamento_id: number;
  departamento?: Departamento;

  ciudad_id: number;
  ciudad?: Ciudad;

  direccion: string;
  sucursal_id: number;

  cargo?: string | undefined;
  fecha_nacimiento?: string | undefined; // "YYYY-MM-DD"
  fecha_ingreso?: string | undefined;    // "YYYY-MM-DD"

  activo: boolean;
  es_vendedor: boolean;
  observacion?: string | undefined;
}

/**
 * El payload que envías para crear/actualizar un Empleado. 
 * Debe coincidir con `EmpleadoCreateUpdateSchema` en el backend.
 */
export interface EmpleadoPayload {
  // ID opcional (por si en PUT envías id: 0 o lo omites)
  id?: number;

  organizacion_id: number;

  tipo_documento_id: number;
  dv?: string | undefined; // opcional si tu backend lo maneja. 
  numero_documento: string;
  nombre_razon_social: string;
  email?: string | undefined;

  telefono1?: string;
  telefono2?: string;
  celular?: string;
  whatsapp?: string;

  tipos_persona_id: number;
  regimen_tributario_id: number;
  moneda_principal_id: number;
  actividad_economica_id?: number | undefined;
  forma_pago_id: number;
  retencion_id?: number | undefined;

  departamento_id: number;
  ciudad_id: number;
  direccion: string;

  sucursal_id: number;

  cargo?: string | undefined;
  fecha_nacimiento?: string | undefined; // "YYYY-MM-DD"
  fecha_ingreso?: string | undefined;    // "YYYY-MM-DD"

  activo: boolean;
  es_vendedor: boolean;

  observacion?: string | undefined;
}
