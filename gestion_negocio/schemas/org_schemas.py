from pydantic import BaseModel
from typing import Optional
from enum import Enum
from datetime import datetime

class OrganizacionBase(BaseModel):
    tipo_documento_id: Optional[int] = None
    numero_documento: Optional[str] = None
    dv: Optional[str] = None
    nombre_fiscal: str
    nombre_comercial: Optional[str] = None
    nombre_corto: Optional[str] = None
    obligado_contabilidad: bool = False
    email_principal: str
    email_alertas_facturacion: Optional[str] = None
    email_alertas_soporte: Optional[str] = None
    celular_whatsapp: Optional[str] = None
    pagina_web: Optional[str] = None
    encabezado_personalizado: Optional[str] = None
    dias_dudoso_recaudo: int = 0
    recibir_copia_email_documentos_electronicos: bool = False
    politica_garantias: Optional[str] = None

    # Plan
    plan_id: Optional[int] = None
    fecha_inicio_plan: Optional[datetime] = None
    fecha_fin_plan: Optional[datetime] = None
    trial_activo: bool = False

class OrganizacionCreate(OrganizacionBase):
    pass

class OrganizacionRead(OrganizacionBase):
    id: int

    class Config:
        from_attributes = True

class NumeracionTransaccionBase(BaseModel):
    tipo_transaccion: Optional[str] = None
    nombre_personalizado: str
    titulo_transaccion: str
    mostrar_info_numeracion: bool = True
    separador_prefijo: Optional[str] = None
    titulo_numeracion: Optional[str] = None
    longitud_numeracion: Optional[int] = None
    numeracion_por_defecto: bool = False
    numero_resolucion: Optional[str] = None
    fecha_expedicion: Optional[str] = None
    fecha_vencimiento: Optional[str] = None
    prefijo: Optional[str] = None
    numeracion_inicial: int
    numeracion_final: int
    numeracion_siguiente: int
    total_maximo_por_transaccion: Optional[int] = None
    transaccion_electronica: bool = False

class NumeracionTransaccionCreate(NumeracionTransaccionBase):
    organizacion_id: int

class NumeracionTransaccionRead(NumeracionTransaccionBase):
    id: int

    class Config:
        from_attributes = True

class SucursalBase(BaseModel):
    nombre: str
    pais: Optional[str] = None
    departamento_id: Optional[int] = None
    ciudad_id: Optional[int] = None
    direccion: Optional[str] = None
    telefonos: Optional[str] = None
    prefijo_transacciones: Optional[str] = None
    sucursal_principal: bool = False
    activa: bool = True

class SucursalCreate(SucursalBase):
    organizacion_id: int

class SucursalRead(SucursalBase):
    id: int

    class Config:
        from_attributes = True

class TiendaVirtualBase(BaseModel):
    plataforma: Optional[str] = None
    nombre: str
    url: Optional[str] = None
    centro_costo_id: Optional[int] = None
    estado: bool = True

class TiendaVirtualCreate(TiendaVirtualBase):
    organizacion_id: int

class TiendaVirtualRead(TiendaVirtualBase):
    id: int

    class Config:
        from_attributes = True

class BodegaBase(BaseModel):
    nombre: str
    bodega_por_defecto: bool = False
    estado: bool = True
    sucursal_id: int

class BodegaCreate(BodegaBase):
    organizacion_id: int

class BodegaRead(BodegaBase):
    id: int

    class Config:
        from_attributes = True

class CentroCostoBase(BaseModel):
    codigo: str
    nombre: str
    nivel: Optional[str] = None  # "PRINCIPAL" o "SUBCENTRO"
    padre_id: Optional[int] = None
    permite_ingresos: bool = True
    estado: bool = True

class CentroCostoCreate(CentroCostoBase):
    organizacion_id: int

class CentroCostoRead(CentroCostoBase):
    id: int

    class Config:
        from_attributes = True

class CajaBase(BaseModel):
    nombre: str
    sucursal_id: int
    estado: bool = True
    vigencia: bool = True

class CajaCreate(CajaBase):
    organizacion_id: int

class CajaRead(CajaBase):
    id: int
    # Podrías agregar timestamps, responsables, etc.

    class Config:
        from_attributes = True

class CuentaBancariaBase(BaseModel):
    tipo_documento_id: Optional[int] = None
    numero_documento_titular: Optional[str] = None
    titular: str
    banco: str
    swift_bic: Optional[str] = None
    direccion_banco: Optional[str] = None
    tipo_cuenta: Optional[str] = None  # Ahorros, Corriente, etc.
    divisa_id: Optional[int] = None
    estado: bool = True
    vigencia: bool = True

class CuentaBancariaCreate(CuentaBancariaBase):
    organizacion_id: int

class CuentaBancariaRead(CuentaBancariaBase):
    id: int

    class Config:
        from_attributes = True
