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
  departamento_id?: number; // si lo tienes, pero no es estrictamente necesario para el payload final
}

export interface Empleado {
  id: number;
  tipo_documento?: TipoDocumento;
  numero_documento: string;
  nombre_razon_social: string;
  email?: string | null;
  telefono1?: string;
  telefono2?: string;
  celular?: string;
  whatsapp?: string;
  tipos_persona_id?: number;
  regimen_tributario_id?: number;
  moneda_principal_id?: number;
  actividad_economica_id?: number;
  forma_pago_id?: number;
  retencion_id?: number;
  departamento?: Departamento;
  ciudad?: Ciudad;
  direccion?: string;
  sucursal_id?: number;
  observacion?: string;
  cargo?: string;
  fecha_nacimiento?: string; // "YYYY-MM-DD"
  fecha_ingreso?: string;    // "YYYY-MM-DD"
  activo?: boolean;
  es_vendedor?: boolean;
}

export interface EmpleadoPayload {
  // Lo mismo que Empleado, pero si prefieres lo mantienes separado.
  // Lo importante es que tenga todos los campos que la API requiere.
  id?: number;  // Se enviará 0 si es nuevo
  tipo_documento?: TipoDocumento;
  numero_documento: string;
  nombre_razon_social: string;
  email: string | null;
  telefono1?: string;
  telefono2?: string;
  celular?: string;
  whatsapp?: string;
  tipos_persona_id?: number;
  regimen_tributario_id?: number;
  moneda_principal_id?: number;
  actividad_economica_id?: number;
  forma_pago_id?: number;
  retencion_id?: number;
  departamento?: Departamento;
  ciudad?: Ciudad;
  direccion?: string;
  sucursal_id?: number;
  observacion?: string;
  cargo?: string;
  fecha_nacimiento?: string;
  fecha_ingreso?: string;
  activo?: boolean;
  es_vendedor?: boolean;
}
