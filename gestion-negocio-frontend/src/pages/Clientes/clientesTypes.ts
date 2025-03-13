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
 * Interfaz principal de un Cliente (lectura).
 * Unifica lo que antes tenías en ClienteResponse y Cliente.
 */
export interface Cliente {
  id: number;
  organizacion_id: number;
  dv?: string;
  
  // Tipo Documento (ID y objeto relacional)
  tipo_documento_id: number;
  tipo_documento?: {
    id: number;
    nombre: string;
    abreviatura: string;
  };

  // Documento y datos de identificación
  numero_documento: string;
  nombre_razon_social: string;
  email?: string;
  pagina_web?: string;
  
  // Ubicación (departamento_id, ciudad_id, etc.)
  departamento_id: number;
  departamento?: {
    id: number;
    nombre: string;
  };
  ciudad_id: number;
  ciudad?: {
    id: number;
    nombre: string;
  };
  direccion: string;

  // Teléfonos
  telefono1?: string;
  telefono2?: string;
  celular?: string;
  whatsapp?: string;

  // Parámetros contables/tributarios
  tipos_persona_id: number;
  regimen_tributario_id: number;
  moneda_principal_id: number;
  tarifa_precios_id: number;
  forma_pago_id: number;

  permitir_venta: boolean;
  descuento: number;
  cupo_credito: number;

  // Varios
  sucursal_id?: number;
  vendedor_id?: number;
  actividad_economica_id?: number;
  retencion_id?: number;
  tipo_marketing_id?: number;
  ruta_logistica_id?: number;
  observacion?: string;
  
  // Campo extra (en la anterior interfaz "Cliente")
  cxc: number; // si tu backend lo retorna (por ejemplo, cuentas por cobrar)
}

/**
 * Interfaz para crear / actualizar un cliente (POST/PUT/PATCH).
 * Coincide con tu backend en 'ClienteSchema' o similar.
 */
export interface ClientePayload {
  organizacion_id: number;

  // Si en el form usas un objeto TipoDocumento, podrías usarlo aquí.
  // O solo 'tipo_documento_id' si envías el ID directamente.
  tipo_documento?: TipoDocumento; // en caso de que lo manejes en el form
  tipo_documento_id?: number;     // si prefieres guardar ID directo

  numero_documento: string;
  nombre_razon_social: string;
  email?: string;
  pagina_web?: string;

  // Ubicación en el form (objeto) y/o IDs directos
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

  sucursal_id?: number;
  vendedor_id?: number;
  actividad_economica_id?: number;
  retencion_id?: number;
  tipo_marketing_id?: number;
  ruta_logistica_id?: number;
  observacion?: string;

  dv?: string; // si necesitas enviar dv
}
