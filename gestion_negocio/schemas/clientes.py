from pydantic import BaseModel, EmailStr, Field, field_validator, model_validator
from typing import Optional
from database import get_db
from models.clientes import Cliente
from pydantic_core.core_schema import ValidationInfo

class ClienteSchema(BaseModel):
    id: int  # Se añade el ID en la respuesta
    tipo_documento_id: int
    numero_documento: str = Field(..., min_length=3, max_length=20)
    nombre_razon_social: str = Field(..., min_length=3)
    email: EmailStr

    # 📌 Dirección (Obligatoria)
    departamento_id: int
    ciudad_id: int
    direccion: str = Field(..., min_length=5)

    # 📌 Contacto (Al menos uno debe estar lleno)
    telefono1: Optional[str] = None
    telefono2: Optional[str] = None
    celular: Optional[str] = None
    whatsapp: Optional[str] = None

    # 📌 Tipo de persona (Predeterminado: Persona Natural)
    tipos_persona_id: int = 1

    # 📌 Régimen tributario (Predeterminado: No Responsable de IVA)
    regimen_tributario_id: int = 5

    # 📌 Otros campos con valores predeterminados
    moneda_principal_id: int = 1
    tarifa_precios_id: int = 1
    forma_pago_id: int = 1
    permitir_venta: bool = True
    descuento: Optional[float] = 0.0
    cupo_credito: Optional[float] = 0.0

    # 🔹 Predeterminar `sucursal_id` y `vendedor_id` con el primer valor disponible en la base de datos
    sucursal_id: int = 1
    vendedor_id: int = 1 

    # Campos opcionales que pueden quedar vacíos
    pagina_web: Optional[str] = None
    actividad_economica_id: Optional[int] = None
    retencion_id: Optional[int] = None
    tipo_marketing_id: Optional[int] = None
    ruta_logistica_id: Optional[int] = None
    observacion: Optional[str] = None

    @field_validator("numero_documento")
    @classmethod
    def validar_numero_documento(cls, value: str, info: ValidationInfo):
        """Valida que el número de documento no esté repetido en la base de datos solo en POST y PUT."""
        
        # Si `operation` no está definido en `info.context`, se asume que es un `GET` y se omite la validación
        if not info.context or info.context.get("operation") == "get":
            return value

        from database import SessionLocal
        db = SessionLocal()
        
        # Verificar si ya existe un cliente con ese número de documento
        cliente_existente = db.query(Cliente).filter(Cliente.numero_documento == value).first()
        db.close()

        if cliente_existente:
            raise ValueError(f"El número de identificación {value} ya está registrado.")

        return value
        
    # 📌 Validación personalizada para asegurar que al menos un número de contacto sea obligatorio
    @model_validator(mode="after")
    def validar_contacto(self):
        if not any([
            self.telefono1,
            self.telefono2,
            self.celular,
            self.whatsapp
        ]):
            raise ValueError("Debe proporcionar al menos un número de contacto (Teléfono, Celular o WhatsApp).")
        return self

    class Config:
        from_attributes = True  # Permite serializar objetos SQLAlchemy correctamente


# 📌 **Esquema para la respuesta del cliente (Incluye ID)**
class ClienteResponseSchema(ClienteSchema):
    id: int  # Se añade el ID en la respuesta

    class Config:
        from_attributes = True  # Asegura compatibilidad con SQLAlchemy
