from pydantic import BaseModel, EmailStr, Field, field_validator, model_validator
from typing import Optional, List
from database import get_db
from models.clientes import Cliente
from pydantic_core.core_schema import ValidationInfo
from .common_schemas import (TipoDocumentoSchema, DepartamentoSchema, CiudadSchema)


# ───────────────────────────────────────────────────────────
# 🔹 ESQUEMA BÁSICO DEL CLIENTE (Para crear / actualizar)
# ───────────────────────────────────────────────────────────
class ClienteSchema(BaseModel):
    id: Optional[int] = None
    tipo_documento: Optional[TipoDocumentoSchema] = None
    numero_documento: str = Field(..., min_length=3, max_length=20)
    nombre_razon_social: str = Field(..., min_length=3)
    email: Optional[EmailStr] = None

    departamento: Optional[DepartamentoSchema] = None
    ciudad: Optional[CiudadSchema] = None
    direccion: str = Field(..., min_length=5)

    telefono1: Optional[str] = None
    telefono2: Optional[str] = None
    celular: Optional[str] = None
    whatsapp: Optional[str] = None

    tipos_persona_id: int = 1
    regimen_tributario_id: int = 5
    moneda_principal_id: int = 1
    tarifa_precios_id: int = 1
    forma_pago_id: int = 1
    permitir_venta: bool = True
    descuento: Optional[float] = 0.0
    cupo_credito: Optional[float] = 0.0
    sucursal_id: int = 1
    vendedor_id: Optional[int] = None

    pagina_web: Optional[str] = None
    actividad_economica_id: Optional[int] = None
    retencion_id: Optional[int] = None
    tipo_marketing_id: Optional[int] = None
    ruta_logistica_id: Optional[int] = None
    observacion: Optional[str] = None

    @field_validator("numero_documento")
    @classmethod
    def validar_numero_documento(cls, value: str, info: ValidationInfo):
        if not info.context or info.context.get("operation") == "get":
            return value

        from database import SessionLocal
        db = SessionLocal()
        cliente_existente = db.query(Cliente).filter(Cliente.numero_documento == value).first()
        db.close()

        if cliente_existente:
            raise ValueError(f"El número de identificación {value} ya está registrado.")
        return value

    @model_validator(mode="after")
    def validar_contacto(self):
        if not any([self.telefono1, self.telefono2, self.celular, self.whatsapp]):
            raise ValueError("Debe proporcionar al menos un número de contacto (Teléfono, Celular o WhatsApp).")
        return self

    @field_validator("nombre_razon_social")
    @classmethod
    def convertir_mayusculas(cls, value: str) -> str:
        return value.upper()

    class Config:
        from_attributes = True

# ───────────────────────────────────────────────────────────
# 🔹 ESQUEMA PARA RESPUESTA DE CLIENTE
#    Incluye el ID y la relación 'tipo_documento' etc.
# ───────────────────────────────────────────────────────────
class ClienteResponseSchema(ClienteSchema):
    id: int
    tipo_documento: Optional[TipoDocumentoSchema] = None

    class Config:
        from_attributes = True

# ───────────────────────────────────────────────────────────
# 🔹 Esquema para respuesta paginada
# ───────────────────────────────────────────────────────────
class PaginatedClientes(BaseModel):
    data: List[ClienteResponseSchema]
    page: int
    total_paginas: int
    total_registros: int

    class Config:
        from_attributes = True
