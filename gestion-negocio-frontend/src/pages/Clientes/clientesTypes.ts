// src/pages/Clientes/clientesTypes.ts

/**
 * Interfaces auxiliares
 */
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
 * Tipo que retorna el backend al consultar un cliente
 * (similar a ClienteResponseSchema).
 */
export interface ClienteResponse {
  id: number;
  tipo_documento_id: number;
  organizacion_id: number;
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
  forma_pago_id: number;
  permitir_venta: boolean;
  descuento: number;
  cupo_credito: number;

  sucursal_id?: number | null;
  vendedor_id?: number | null;
  actividad_economica_id?: number | null;
  retencion_id?: number | null;
  tipo_marketing_id?: number | null;
  ruta_logistica_id?: number | null;
  observacion?: string | null;
  // También podría haber "departamento", "ciudad" relacionales, etc.
}

/**
 * Este es el tipo para crear / actualizar un cliente.
 * Coincide con `ClienteSchema` (o `ClienteUpdateSchema`) del backend.
 */
export interface ClientePayload {
  // Multi-tenant
  organizacion_id: number;

  // Tipo documento (en el form guardas un objeto, pero al enviar necesitas el ID)
  tipo_documento?: TipoDocumento;
  tipo_documento_id?: number; // opcional si prefieres guardarlo directo

  numero_documento: string;
  nombre_razon_social: string;
  email?: string | null;
  pagina_web?: string;

  // Ubicación
  departamento?: Departamento; // en el form
  ciudad?: Ciudad;            // en el form
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
  sucursal_id?: number;
  vendedor_id?: number | null;

  actividad_economica_id?: number;
  retencion_id?: number;
  tipo_marketing_id?: number;
  ruta_logistica_id?: number;
  observacion?: string;

  // Si deseas un `dv`, lo pones aquí, pero normalmente el backend lo calcula.
  dv?: string | null;
}
