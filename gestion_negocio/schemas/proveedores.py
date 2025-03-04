from pydantic import BaseModel, EmailStr, Field, model_validator, field_validator
from typing import Optional, List

# Reusa tus esquemas si los deseas
from .common_schemas import (
    TipoDocumentoSchema,
    DepartamentoSchema,
    CiudadSchema
)

class ProveedorSchema(BaseModel):
    """
    Esquema base para crear/actualizar un Proveedor
    sin llamadas a la BD.
    """
    id: Optional[int] = None

    # Multi-tenant
    organizacion_id: int = Field(..., description="ID de la organización dueña del proveedor")

    # Relación con tipo_documento:
    tipo_documento_id: int = Field(..., description="ID del tipo de documento (p.ej. NIT=2, CC=1, etc.)")
    tipo_documento: Optional[TipoDocumentoSchema] = None

    # DV (dígito de verificación), calculado en la capa de servicios/model
    dv: Optional[str] = Field(None, description="Dígito de verificación si es NIT")

    numero_documento: str = Field(..., min_length=3, max_length=20)
    nombre_razon_social: str = Field(..., min_length=3)
    email: Optional[EmailStr] = None
    pagina_web: Optional[str] = None

    # Ubicación
    departamento_id: int
    ciudad_id: int
    direccion: str = Field(..., min_length=1)
    telefono1: Optional[str] = None
    telefono2: Optional[str] = None
    celular: Optional[str] = None
    whatsapp: Optional[str] = None

    # Catálogos
    tipos_persona_id: int = 1
    regimen_tributario_id: int = 5
    moneda_principal_id: int = 1
    tarifa_precios_id: int = 1
    actividad_economica_id: Optional[int] = None
    forma_pago_id: int = 1
    retencion_id: Optional[int] = None

    permitir_venta: bool = True
    descuento: float = 0.0
    cupo_credito: float = 0.0

    # No se incluye: tipo_marketing_id, ruta_logistica_id, vendedor_id
    sucursal_id: int
    observacion: Optional[str] = None

    # Relacionados
    departamento: Optional[DepartamentoSchema] = None
    ciudad: Optional[CiudadSchema] = None

    @model_validator(mode="after")
    def validar_contacto(self):
        """
        Requiere al menos un número de contacto 
        (telefono1, telefono2, celular o whatsapp).
        """
        if not any([self.telefono1, self.telefono2, self.celular, self.whatsapp]):
            raise ValueError("Debe proporcionar al menos un número de contacto (teléfono/celular/whatsapp).")
        return self

    @field_validator("nombre_razon_social")
    @classmethod
    def convertir_mayusculas(cls, value: str) -> str:
        """Convierte la razón social a mayúsculas."""
        return value.upper()

    class Config:
        from_attributes = True


class ProveedorUpdateSchema(BaseModel):
    """ Todos los campos opcionales para permitir actualización parcial. """
    organizacion_id: Optional[int] = None
    tipo_documento_id: Optional[int] = None
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
    sucursal_id: Optional[int] = None
    observacion: Optional[str] = None

    class Config:
        extra = "ignore"  # Ignora campos desconocidos del front

class ProveedorResponseSchema(ProveedorSchema):
    """ 
    Esquema para devolver datos de un proveedor.
    """
    id: int

    class Config:
        from_attributes = True


class PaginatedProveedores(BaseModel):
    """
    Respuesta paginada para listar proveedores.
    """
    data: List[ProveedorResponseSchema]
    page: int
    total_paginas: int
    total_registros: int

    class Config:
        from_attributes = True
