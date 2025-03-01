from sqlalchemy import Column, Integer, String, Boolean, Float, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship, validates
from . import Base
from services.dv_calculator import calc_dv_if_nit  # si deseas calcular DV como en clientes

class Proveedor(Base):
    __tablename__ = "proveedores"

    id = Column(Integer, primary_key=True, autoincrement=True)

    # Multi-tenant: proveedor pertenece a UNA organización
    organizacion_id = Column(Integer, ForeignKey("organizaciones.id"), nullable=False)
    organizacion = relationship("Organizacion")

    # Relación a 'tipo_documento' (ej. 2=NIT, 1=CC, etc.)
    tipo_documento_id = Column(Integer, ForeignKey("tipo_documento.id"), nullable=False)
    tipo_documento = relationship("TipoDocumento")

    # DV -> opcional, si quieres manejar el dígito de verificación para NIT
    dv = Column(String(5), nullable=True)

    # Ya NO es unique globalmente, sino con (organizacion_id, numero_documento)
    numero_documento = Column(String(50), nullable=False)

    nombre_razon_social = Column(String(100), nullable=False)
    email = Column(String(100), nullable=True)
    pagina_web = Column(String(255), nullable=True)

    departamento_id = Column(Integer, ForeignKey("departamentos.id"), nullable=False)
    departamento = relationship("Departamento")

    ciudad_id = Column(Integer, ForeignKey("ciudades.id"), nullable=False)
    ciudad = relationship("Ciudad")

    direccion = Column(String(255), nullable=False)
    telefono1 = Column(String(20), nullable=True)
    telefono2 = Column(String(20), nullable=True)
    celular = Column(String(20), nullable=True)
    whatsapp = Column(String(20), nullable=True)

    tipos_persona_id = Column(Integer, ForeignKey("tipos_persona.id"), nullable=False)
    tipos_persona = relationship("TipoPersona")

    regimen_tributario_id = Column(Integer, ForeignKey("regimen_tributario.id"), nullable=False)
    regimen_tributario = relationship("RegimenTributario")

    moneda_principal_id = Column(Integer, ForeignKey("monedas.id"), nullable=False)
    moneda = relationship("Moneda")

    tarifa_precios_id = Column(Integer, ForeignKey("tarifa_precios.id"), nullable=False)
    tarifa_precios = relationship("TarifaPrecios")

    actividad_economica_id = Column(Integer, ForeignKey("actividades_economicas.id"), nullable=True)
    actividad_economica = relationship("ActividadEconomica")

    forma_pago_id = Column(Integer, ForeignKey("formas_pago.id"), nullable=False)
    forma_pago = relationship("FormaPago")

    retencion_id = Column(Integer, ForeignKey("retenciones.id"), nullable=True)
    retencion = relationship("Retencion")

    permitir_venta = Column(Boolean, default=True)
    descuento = Column(Float, default=0)
    cupo_credito = Column(Float, default=0)

    # No se usa: tipo_marketing_id, ruta_logistica_id, vendedor_id

    # Sucursal => multi-tenant, si deseas:
    sucursal_id = Column(Integer, ForeignKey("sucursales.id"), nullable=True)
    sucursal = relationship("Sucursal")

    observacion = Column(String(255), nullable=True)

    # Unicidad => (organizacion_id, numero_documento)
    __table_args__ = (
        UniqueConstraint("organizacion_id", "numero_documento", name="uq_proveedor_org_doc"),
    )

    @validates("numero_documento")
    def validate_numero_documento(self, key, value):
        """
        Opcional: si quieres autocalcular DV para NIT (como en cliente).
        """
        if value:
            computed_dv = calc_dv_if_nit(self.tipo_documento_id, value)
            if computed_dv:
                self.dv = computed_dv
        return value

    def __repr__(self):
        return f"<Proveedor id={self.id} doc={self.numero_documento} org={self.organizacion_id}>"
