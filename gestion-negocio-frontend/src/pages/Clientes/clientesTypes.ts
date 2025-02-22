export interface Cliente {
    id: number;
    tipo_documento: string;
    numero_documento: string;
    nombre_razon_social: string;
    email: string;
    direccion: string;
    telefono1?: string;
    telefono2?: string;
    celular?: string;
    whatsapp?: string;
    cxc?: number;
}
