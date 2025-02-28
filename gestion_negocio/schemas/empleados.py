# gestion_negocio/schemas/empleados.py

from pydantic import BaseModel, EmailStr, Field, field_validator, model_validator
from typing import Optional, List
from datetime import date
from database import get_db
from models.empleados import Empleado
from pydantic_core.core_schema import ValidationInfo
from .common_schemas import (TipoDocumentoSchema, DepartamentoSchema, CiudadSchema)

# ─────────────────────────────────────────────────────
# 1) EmpleadoBase: Sin validación de duplicado
# ─────────────────────────────────────────────────────
class EmpleadoBase(BaseModel):
    tipo_documento: Optional[TipoDocumentoSchema] = None
    numero_documento: str = Field(..., min_length=3, max_length=20)
    nombre_razon_social: str = Field(..., min_length=3)
    email: Optional[EmailStr] = None
    telefono1: Optional[str] = None
    telefono2: Optional[str] = None
    celular: Optional[str] = None
    whatsapp: Optional[str] = None
    tipos_persona_id: int = 1
    regimen_tributario_id: int = 5
    moneda_principal_id: int = 1
    actividad_economica_id: Optional[int] = None
    forma_pago_id: int = 1
    retencion_id: Optional[int] = None
    departamento: Optional[DepartamentoSchema] = None
    ciudad: Optional[CiudadSchema] = None
    direccion: str = Field(..., min_length=5)
    sucursal_id: int = 1
    observacion: Optional[str] = None
    cargo: Optional[str] = None
    fecha_nacimiento: Optional[date] = None
    fecha_ingreso: Optional[date] = None
    activo: bool = True
    es_vendedor: bool = False

    @model_validator(mode="after")
    def validar_contacto(self):
        if not any([self.telefono1, self.telefono2, self.celular, self.whatsapp]):
            raise ValueError("Debe proporcionar al menos un número de contacto.")
        return self

    @field_validator("nombre_razon_social")
    def mayusculas(cls, v):
        return v.upper()

    class Config:
        from_attributes = True

# EmpleadoCreateUpdateSchema: sin validador de documento duplicado
class EmpleadoCreateUpdateSchema(EmpleadoBase):
    pass

# EmpleadoResponseSchema: para retornar en GET
class EmpleadoResponseSchema(EmpleadoBase):
    id: int
    class Config:
        from_attributes = True

class PaginatedEmpleados(BaseModel):
    data: List[EmpleadoResponseSchema]
    page: int
    total_paginas: int
    total_registros: int
    class Config:
        from_attributes = True