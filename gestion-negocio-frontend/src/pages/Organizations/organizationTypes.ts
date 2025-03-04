// src/pages/Organizations/organizationTypes.ts

export interface Organization {
    id: number;
    tipo_documento_id?: number | null;
    numero_documento?: string | null;
    dv?: string | null;
    nombre_fiscal: string;
    nombre_comercial?: string | null;
    nombre_corto?: string | null;
    obligado_contabilidad: boolean;
    email_principal: string;
    email_alertas_facturacion?: string | null;
    email_alertas_soporte?: string | null;
    celular_whatsapp?: string | null;
    pagina_web?: string | null;
    encabezado_personalizado?: string | null;
    dias_dudoso_recaudo: number;
    recibir_copia_email_documentos_electronicos: boolean;
    politica_garantias?: string | null;
    plan_id?: number | null;
    fecha_inicio_plan?: string | null;  // o Date
    fecha_fin_plan?: string | null;     // o Date
    trial_activo: boolean;
  }
  
  export interface OrganizationPayload {
    tipo_documento_id?: number | null;
    numero_documento?: string | null;
    dv?: string | null;
    nombre_fiscal: string;
    nombre_comercial?: string | null;
    nombre_corto?: string | null;
    obligado_contabilidad: boolean;
    email_principal: string;
    email_alertas_facturacion?: string | null;
    email_alertas_soporte?: string | null;
    celular_whatsapp?: string | null;
    pagina_web?: string | null;
    encabezado_personalizado?: string | null;
    dias_dudoso_recaudo: number;
    recibir_copia_email_documentos_electronicos: boolean;
    politica_garantias?: string | null;
    // El backend ignora plan fields en esta página: plan_id, fecha_inicio_plan, etc.
  }
  