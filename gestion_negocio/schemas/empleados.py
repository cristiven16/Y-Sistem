from pydantic import BaseModel, EmailStr, Field, field_validator, model_validator
from typing import Optional, List
from datetime import date

# Reusa tus esquemas si lo deseas
from .common_schemas import (
    TipoDocumentoSchema,
    DepartamentoSchema,
    CiudadSchema
)

class EmpleadoBase(BaseModel):
    """
    Esquema base para crear / actualizar un Empleado,
    sin consultas a la BD (toda lógica de unicidad y DV en la capa de servicios).
    """

    id: Optional[int] = None

    # Multi-tenant
    organizacion_id: int = Field(..., description="Organización a la que pertenece el empleado")

    tipo_documento_id: int = Field(..., description="Ej. 1=CC, 2=NIT, etc.")
    tipo_documento: Optional[TipoDocumentoSchema] = None

    dv: Optional[str] = Field(None, description="Dígito de verificación si es NIT")
    numero_documento: str = Field(..., min_length=3, max_length=20)
    nombre_razon_social: str = Field(..., min_length=3)
    email: Optional[EmailStr] = None

    # Contactos
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

    departamento_id: int
    ciudad_id: int
    direccion: str = Field(..., min_length=1)

    sucursal_id: int

    cargo: Optional[str] = None
    fecha_nacimiento: Optional[date] = None
    fecha_ingreso: Optional[date] = None

    activo: bool = True
    es_vendedor: bool = False

    observacion: Optional[str] = None

    @model_validator(mode="after")
    def validar_contacto(self):
        """
        Exige al menos un número de contacto (teléfono1, teléfono2, celular o whatsapp).
        """
        if not any([self.telefono1, self.telefono2, self.celular, self.whatsapp]):
            raise ValueError("Debe proporcionar al menos un contacto (teléfono o celular).")
        return self

    @field_validator("nombre_razon_social")
    @classmethod
    def mayusculas(cls, value: str):
        """Convierte el campo a mayúsculas."""
        return value.upper()

    class Config:
        from_attributes = True


class EmpleadoCreateUpdateSchema(EmpleadoBase):
    """
    Se puede usar para crear o actualizar Empleado.
    Sin validación de BD (unique), pues va en servicios.
    """
    pass

class EmpleadoPatchSchema(BaseModel):
    """
    Todos los campos son opcionales 
    para permitir una actualización parcial (PATCH).
    """
    organizacion_id: Optional[int] = None
    tipo_documento_id: Optional[int] = None
    dv: Optional[str] = None
    numero_documento: Optional[str] = None
    nombre_razon_social: Optional[str] = None
    email: Optional[EmailStr] = None

    telefono1: Optional[str] = None
    telefono2: Optional[str] = None
    celular: Optional[str] = None
    whatsapp: Optional[str] = None

    tipos_persona_id: Optional[int] = None
    regimen_tributario_id: Optional[int] = None
    moneda_principal_id: Optional[int] = None
    actividad_economica_id: Optional[int] = None
    forma_pago_id: Optional[int] = None
    retencion_id: Optional[int] = None

    departamento_id: Optional[int] = None
    ciudad_id: Optional[int] = None
    direccion: Optional[str] = None

    sucursal_id: Optional[int] = None
    cargo: Optional[str] = None
    fecha_nacimiento: Optional[date] = None
    fecha_ingreso: Optional[date] = None

    activo: Optional[bool] = None
    es_vendedor: Optional[bool] = None

    observacion: Optional[str] = None

    class Config:
        extra = "ignore"

class EmpleadoResponseSchema(EmpleadoBase):
    """
    Esquema para devolver datos de un Empleado, con ID forzado.
    """
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
