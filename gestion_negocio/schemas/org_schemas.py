from pydantic import BaseModel
from typing import Optional, List, Literal
from enum import Enum
from datetime import datetime
from .common_schemas import (
    TipoDocumentoSchema,
    DepartamentoSchema,
    CiudadSchema
)

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
    fecha_expedicion: Optional[datetime] = None  # Puedes usar datetime
    fecha_vencimiento: Optional[datetime] = None
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
    organizacion_id: int  # para reflejar la org
    # Anidar la sucursal
    #sucursal: Optional["SucursalNested"] = None  # de tu schema SucursalNested
    
    class Config:
        from_attributes = True

class PaginatedNumeraciones(BaseModel):
    data: List[NumeracionTransaccionRead]
    page: int
    total_paginas: int
    total_registros: int

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
    organizacion_id: int
    nombre: str
    pais: Optional[str]
    departamento_id: Optional[int]
    ciudad_id: Optional[int]
    direccion: Optional[str]
    telefonos: Optional[str]
    prefijo_transacciones: Optional[str]
    sucursal_principal: bool
    activa: bool

    # 🔹 Relación:
    departamento: Optional[DepartamentoSchema] = None
    ciudad: Optional[CiudadSchema] = None

    class Config:
        from_attributes = True

class SucursalUpdate(BaseModel):
    organizacion_id: Optional[int] = None
    nombre: Optional[str] = None
    pais: Optional[str] = None
    departamento_id: Optional[int] = None
    ciudad_id: Optional[int] = None
    direccion: Optional[str] = None
    telefonos: Optional[str] = None
    prefijo_transacciones: Optional[str] = None
    sucursal_principal: Optional[bool] = None
    activa: Optional[bool] = None

    class Config:
        extra = "ignore"   # Ignora campos no definidos, si llegaran del front

class SucursalNested(BaseModel):
    id: int
    nombre: str
    # si deseas otros campos
    
    class Config:
        from_attributes = True

class PaginatedSucursales(BaseModel):
    data: List[SucursalRead]
    page: int
    total_paginas: int
    total_registros: int

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
    organizacion_id: int  # para reflejar la org
    # Anidar la sucursal
    sucursal: Optional["SucursalNested"] = None  # de tu schema SucursalNested
    
    class Config:
        from_attributes = True

class BodegaBase(BaseModel):
    nombre: str
    bodega_por_defecto: bool = False
    estado: bool = True
    sucursal_id: int

class BodegaCreate(BodegaBase):
    organizacion_id: int

class BodegaRead(BaseModel):
    id: int
    organizacion_id: int
    sucursal_id: int
    nombre: str
    bodega_por_defecto: bool
    estado: bool

    # Relación anidada
    sucursal: Optional[SucursalNested] = None
    
    class Config:
        from_attributes = True

class PaginatedBodegas(BaseModel):
    data: List[BodegaRead]
    page: int
    total_paginas: int
    total_registros: int

    class Config:
        from_attributes = True

class CentroCostoBase(BaseModel):
    codigo: str
    nombre: str
    nivel: Optional[Literal["PRINCIPAL", "SUBCENTRO"]] = None  # "PRINCIPAL" o "SUBCENTRO"
    padre_id: Optional[int] = None
    permite_ingresos: bool = True
    estado: bool = True

class CentroCostoCreate(CentroCostoBase):
    organizacion_id: int

class CentroCostoRead(CentroCostoBase):
    id: int
    organizacion_id: int  # para reflejar la org
    # Anidar la sucursal
    sucursal: Optional["SucursalNested"] = None  # de tu schema SucursalNested
    
    class Config:
        from_attributes = True

class PaginatedCentrosCostos(BaseModel):
    data: List[CentroCostoRead]
    page: int
    total_paginas: int
    total_registros: int

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
    organizacion_id: int  # para reflejar la org
    # Anidar la sucursal
    sucursal: Optional["SucursalNested"] = None  # de tu schema SucursalNested
    
    class Config:
        from_attributes = True

class PaginatedCajas(BaseModel):
    data: List[CajaRead]
    page: int
    total_paginas: int
    total_registros: int

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
    organizacion_id: int  # para reflejar la org
    # Anidar la sucursal
    sucursal: Optional["SucursalNested"] = None  # de tu schema SucursalNested
    
    class Config:
        from_attributes = True
