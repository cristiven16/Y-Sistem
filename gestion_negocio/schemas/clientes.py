# gestion_negocio/schemas/clientes.py

from pydantic import BaseModel, EmailStr, Field, model_validator, field_validator
from typing import Optional, List

# Si deseas reusar esquemas para datos relacionados
# (tipo_documento, departamento, ciudad, etc.), importa desde tus common_schemas
from .common_schemas import (
    TipoDocumentoSchema,
    DepartamentoSchema,
    CiudadSchema
)

# ───────────────────────────────────────────────────────────
# 🔹 ESQUEMA BÁSICO DEL CLIENTE (Para crear / actualizar)
# ───────────────────────────────────────────────────────────
class ClienteSchema(BaseModel):
    """ 
    Esquema base para crear/actualizar un Cliente.
    NO realiza consultas a la BD (toda lógica avanzada va a services/).
    """

    # Para creación/actualización, id es opcional
    id: Optional[int] = None

    # Campos que indican la FK a 'tipo_documento' y su instancia (opcional en la respuesta)
    tipo_documento_id: int = Field(..., description="ID del tipo de documento (ej. NIT=2, CC=1, etc.)")
    tipo_documento: Optional[TipoDocumentoSchema] = None

    # Campos multi-tenant
    organizacion_id: int = Field(..., description="ID de la organización a la que pertenece el cliente")

    # DV (dígito de verificación para NIT), calculado en la capa de servicios
    dv: Optional[str] = Field(None, description="Dígito de verificación (NIT)")

    # Documento / Razón social
    numero_documento: str = Field(..., min_length=3, max_length=20, description="Número de documento del cliente")
    nombre_razon_social: str = Field(..., min_length=3, description="Razón social o nombre completo")

    email: Optional[EmailStr] = None
    pagina_web: Optional[str] = None

    # Ubicación
    departamento_id: int = Field(..., description="ID del departamento")
    ciudad_id: int = Field(..., description="ID de la ciudad")
    direccion: str = Field(..., min_length=1, description="Dirección de residencia/fiscal")

    telefono1: Optional[str] = None
    telefono2: Optional[str] = None
    celular: Optional[str] = None
    whatsapp: Optional[str] = None

    # Catálogos y configuración
    tipos_persona_id: int = 1
    regimen_tributario_id: int = 5
    moneda_principal_id: int = 1
    tarifa_precios_id: int = 1
    forma_pago_id: int = 1

    permitir_venta: bool = True
    descuento: float = 0.0
    cupo_credito: float = 0.0

    # Sucursal opcional
    sucursal_id: Optional[int] = None

    # Otros
    vendedor_id: Optional[int] = None
    actividad_economica_id: Optional[int] = None
    retencion_id: Optional[int] = None
    tipo_marketing_id: Optional[int] = None
    ruta_logistica_id: Optional[int] = None
    observacion: Optional[str] = None

    # Campos relacionados en la respuesta (opcionales)
    departamento: Optional[DepartamentoSchema] = None
    ciudad: Optional[CiudadSchema] = None

    # Validador que exige al menos un número de contacto
    @model_validator(mode="after")
    def validar_contacto(self):
        if not any([self.telefono1, self.telefono2, self.celular, self.whatsapp]):
            raise ValueError("Debe proporcionar al menos un número de contacto (teléfono/celular/whatsapp).")
        return self

    # Validador para convertir a mayúsculas la razón social
    @field_validator("nombre_razon_social")
    @classmethod
    def convertir_mayusculas(cls, value: str) -> str:
        return value.upper()

    class Config:
        from_attributes = True
        # Puedes usar extra="forbid" si deseas rechazar campos no definidos.


class ClienteUpdateSchema(BaseModel):
    """
    Todos los campos opcionales para permitir actualización parcial.
    """
    tipo_documento_id: Optional[int] = None
    organizacion_id: Optional[int] = None
    dv: Optional[str] = None
    numero_documento: Optional[str] = None
    nombre_razon_social: Optional[str] = None
    email: Optional[EmailStr] = None
    pagina_web: Optional[str] = None

    departamento_id: Optional[int] = None
    ciudad_id: Optional[int] = None
    direccion: Optional[str] = None
    telefono1: Optional[str] = None
    telefono2: Optional[str] = None
    celular: Optional[str] = None
    whatsapp: Optional[str] = None

    tipos_persona_id: Optional[int] = None
    regimen_tributario_id: Optional[int] = None
    moneda_principal_id: Optional[int] = None
    tarifa_precios_id: Optional[int] = None
    actividad_economica_id: Optional[int] = None
    forma_pago_id: Optional[int] = None
    retencion_id: Optional[int] = None
    permitir_venta: Optional[bool] = None
    descuento: Optional[float] = None
    cupo_credito: Optional[float] = None
    tipo_marketing_id: Optional[int] = None
    sucursal_id: Optional[int] = None
    ruta_logistica_id: Optional[int] = None
    vendedor_id: Optional[int] = None
    observacion: Optional[str] = None

    class Config:
        extra = "ignore"


# ───────────────────────────────────────────────────────────
# 🔹 ESQUEMA PARA RESPUESTA DE CLIENTE
#    Incluye el ID y la relación 'tipo_documento', etc.
# ───────────────────────────────────────────────────────────
class ClienteResponseSchema(ClienteSchema):
    """
    Esquema especializado para devolver la info de un Cliente.
    """
    id: int

    class Config:
        from_attributes = True


# ───────────────────────────────────────────────────────────
# 🔹 Esquema para respuesta paginada
# ───────────────────────────────────────────────────────────
class PaginatedClientes(BaseModel):
    """
    Estructura estándar para devolver múltiples clientes paginados.
    """
    data: List[ClienteResponseSchema]
    page: int
    total_paginas: int
    total_registros: int

    class Config:
        from_attributes = True
