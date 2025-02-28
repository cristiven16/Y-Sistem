// src/pages/Proveedores/proveedoresTypes.ts

// Interfaces para subobjetos:
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

// Interfaz para mostrar datos en la tabla (simplificada)
export interface Proveedor {
  id: number;
  nombre_razon_social: string;
  // 🔹 Si quieres mostrar sólo la abreviatura del tipo de doc, 
  //    podrías usar la prop: tipo_documento?: string; 
  //    o dejarlo como un objeto:
  tipo_documento?: string; 
  numero_documento: string;

  telefono1?: string;
  telefono2?: string;
  celular?: string;
  whatsapp?: string;
  direccion: string;
  email: string;
  
  // Cuentas por pagar o CXC si tu backend lo maneja:
  cxc?: number;
}

// Interfaz para el payload al crear/editar un Proveedor
// (muy similar a "ClientePayload", pero sin campos como
//  vendedor_id, tipo_marketing_id, ruta_logistica_id, etc.)
export interface ProveedorPayload {
  id?: number;
  tipo_documento?: TipoDocumento;  // Subobjeto, si tu backend lo maneja así
  numero_documento: string;
  nombre_razon_social: string;
  email?: string;

  departamento?: Departamento;     // Subobjeto
  ciudad?: Ciudad;                // Subobjeto
  direccion: string;

  telefono1?: string;
  telefono2?: string;
  celular?: string;
  whatsapp?: string;

  // Campos por defecto en tu backend
  tipos_persona_id: number;
  regimen_tributario_id: number;
  moneda_principal_id: number;
  tarifa_precios_id: number;
  forma_pago_id: number;
  permitir_venta: boolean;
  descuento?: number;
  cupo_credito?: number;
  sucursal_id: number;

  // Campos opcionales
  pagina_web?: string;
  actividad_economica_id?: number;
  retencion_id?: number;
  observacion?: string;
}
