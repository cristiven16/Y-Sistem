// src/pages/Clientes/clientesTypes.ts
// Interfaces para subobjetos
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
export interface Cliente {
    id: number;
    nombre_razon_social: string;
    tipo_documento?: string; // <-- Nueva propiedad
    numero_documento: string;
    telefono1?: string;
    telefono2?: string;
    celular?: string;
    whatsapp?: string;
    direccion: string;
    email: string;
    cxc?: number;  // si en tu backend calculas cxc o la guardas
  }
  
  // Interfaz para el payload al crear/editar un cliente
  export interface ClientePayload {
    id?: number;
    tipo_documento?: TipoDocumento;
    numero_documento: string;
    nombre_razon_social: string;
    email: string;
    departamento?: Departamento;    // subobjeto
    ciudad?: Ciudad;               // subobjeto
    direccion: string;
    telefono1?: string;
    telefono2?: string;
    celular?: string;
    whatsapp?: string;
  
    // Por defecto en tu backend
    tipos_persona_id: number;
    regimen_tributario_id: number;
    moneda_principal_id: number;
    tarifa_precios_id: number;
    forma_pago_id: number;
    permitir_venta: boolean;
    descuento?: number;
    cupo_credito?: number;
    sucursal_id: number;
    vendedor_id: number;
  
    // Opcionales
    pagina_web?: string;
    actividad_economica_id?: number;
    retencion_id?: number;
    tipo_marketing_id?: number;
    ruta_logistica_id?: number;
    observacion?: string;
  }
  