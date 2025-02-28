from sqlalchemy import Column, Integer, String, Boolean, Date, ForeignKey
from sqlalchemy.orm import relationship
from database import Base

class Empleado(Base):
    __tablename__ = "empleados"

    id = Column(Integer, primary_key=True, autoincrement=True)

    # Documento e info básica
    tipo_documento_id = Column(Integer, ForeignKey("tipo_documento.id"), nullable=False)
    numero_documento = Column(String(50), unique=True, nullable=False)
    nombre_razon_social = Column(String(100), nullable=False)  # <-- en lugar de "nombre"
    email = Column(String(100), nullable=True)

    # Contactos (todos nullable, se valida luego en la lógica que haya al menos uno)
    telefono1 = Column(String(20), nullable=True)
    telefono2 = Column(String(20), nullable=True)
    celular = Column(String(20), nullable=True)
    whatsapp = Column(String(20), nullable=True)

    # Datos tributarios
    tipos_persona_id = Column(Integer, ForeignKey("tipos_persona.id"), nullable=False)
    regimen_tributario_id = Column(Integer, ForeignKey("regimen_tributario.id"), nullable=False)
    moneda_principal_id = Column(Integer, ForeignKey("monedas.id"), nullable=False)
    actividad_economica_id = Column(Integer, ForeignKey("actividades_economicas.id"), nullable=True)
    forma_pago_id = Column(Integer, ForeignKey("formas_pago.id"), nullable=False)
    retencion_id = Column(Integer, ForeignKey("retenciones.id"), nullable=True)

    # Ubicación (todos obligatorios según tu requisito)
    departamento_id = Column(Integer, ForeignKey("departamentos.id"), nullable=False)
    ciudad_id = Column(Integer, ForeignKey("ciudades.id"), nullable=False)
    direccion = Column(String(255), nullable=False)

    # Relación con sucursal
    sucursal_id = Column(Integer, ForeignKey("sucursal.id"), nullable=False)

    # Observaciones
    observacion = Column(String(255), nullable=True)

    # Campos adicionales solicitados
    cargo = Column(String(100), nullable=True)
    fecha_nacimiento = Column(Date, nullable=True)
    fecha_ingreso = Column(Date, nullable=True)
    activo = Column(Boolean, default=True)
    es_vendedor = Column(Boolean, default=False)

    # Relaciones con otras tablas
    tipo_documento = relationship("TipoDocumento")
    regimen_tributario = relationship("RegimenTributario")
    tipos_persona = relationship("TipoPersona")
    forma_pago = relationship("FormaPago")
    moneda = relationship("Moneda")
    departamento = relationship("Departamento")
    ciudad = relationship("Ciudad")
    actividad_economica = relationship("ActividadEconomica")
    retencion = relationship("Retencion")
    sucursal = relationship("Sucursal")
