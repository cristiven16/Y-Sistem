from sqlalchemy import (
    Column, Integer, String, Boolean, Float, Date, ForeignKey, UniqueConstraint
)
from sqlalchemy.orm import relationship, validates
from . import Base
from services.dv_calculator import calc_dv_if_nit  # opcional si quieres autocalcular DV

class Empleado(Base):
    __tablename__ = "empleados"

    id = Column(Integer, primary_key=True, autoincrement=True)

    # Multi-tenant: cada Empleado pertenece a UNA organización
    organizacion_id = Column(Integer, ForeignKey("organizaciones.id"), nullable=False)
    organizacion = relationship("Organizacion")

    # Documento e info básica
    tipo_documento_id = Column(Integer, ForeignKey("tipo_documento.id"), nullable=False)
    tipo_documento = relationship("TipoDocumento")

    # Para DV (solo si tipo_documento = NIT)
    dv = Column(String(5), nullable=True)

    # (organizacion_id, numero_documento) único
    numero_documento = Column(String(50), nullable=False)

    nombre_razon_social = Column(String(100), nullable=False)  # en lugar de "nombre"
    email = Column(String(100), nullable=True)

    # Contactos (todos nullable, se valida luego en la capa de servicios o en el schema)
    telefono1 = Column(String(20), nullable=True)
    telefono2 = Column(String(20), nullable=True)
    celular = Column(String(20), nullable=True)
    whatsapp = Column(String(20), nullable=True)

    # Datos tributarios / catálogos
    tipos_persona_id = Column(Integer, ForeignKey("tipos_persona.id"), nullable=False)
    tipos_persona = relationship("TipoPersona")

    regimen_tributario_id = Column(Integer, ForeignKey("regimen_tributario.id"), nullable=False)
    regimen_tributario = relationship("RegimenTributario")

    moneda_principal_id = Column(Integer, ForeignKey("monedas.id"), nullable=False)
    moneda = relationship("Moneda")

    actividad_economica_id = Column(Integer, ForeignKey("actividades_economicas.id"), nullable=True)
    actividad_economica = relationship("ActividadEconomica")

    forma_pago_id = Column(Integer, ForeignKey("formas_pago.id"), nullable=False)
    forma_pago = relationship("FormaPago")

    retencion_id = Column(Integer, ForeignKey("retenciones.id"), nullable=True)
    retencion = relationship("Retencion")

    # Ubicación
    departamento_id = Column(Integer, ForeignKey("departamentos.id"), nullable=False)
    departamento = relationship("Departamento")

    ciudad_id = Column(Integer, ForeignKey("ciudades.id"), nullable=False)
    ciudad = relationship("Ciudad")

    direccion = Column(String(255), nullable=False)

    # Relación con sucursal
    sucursal_id = Column(Integer, ForeignKey("sucursales.id"), nullable=False)
    sucursal = relationship("Sucursal")

    # Observaciones / otros campos
    cargo = Column(String(100), nullable=True)  # Cargo opcional
    fecha_nacimiento = Column(Date, nullable=True)
    fecha_ingreso = Column(Date, nullable=True)

    activo = Column(Boolean, default=True)
    es_vendedor = Column(Boolean, default=False)

    observacion = Column(String(255), nullable=True)

    # Unicidad => un empleado con el mismo numero_documento no se repite en la misma org
    __table_args__ = (
        UniqueConstraint("organizacion_id", "numero_documento", name="uq_empleado_org_doc"),
    )

    @validates("numero_documento")
    def validate_numero_documento(self, key, value):
        """
        Opcional: autocalcular DV si el tipo_documento_id corresponde a NIT.
        """
        if value:
            computed_dv = calc_dv_if_nit(self.tipo_documento_id, value)
            if computed_dv:
                self.dv = computed_dv
        return value

    def __repr__(self):
        return f"<Empleado id={self.id} doc={self.numero_documento} org={self.organizacion_id}>"
