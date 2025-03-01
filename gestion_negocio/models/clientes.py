# models/clientes.py

from sqlalchemy import Column, Integer, String, Boolean, Float, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship, validates
from . import Base
from services.dv_calculator import calc_dv_if_nit

class Cliente(Base):
    __tablename__ = "clientes"

    id = Column(Integer, primary_key=True, autoincrement=True)

    # Relación a 'tipo_documento'
    tipo_documento_id = Column(Integer, ForeignKey("tipo_documento.id"), nullable=False)
    tipo_documento = relationship("TipoDocumento")

    # DV -> opcional, para cuando sea NIT
    dv = Column(String(5), nullable=True)

    # Conjunto => unique por organizacion
    organizacion_id = Column(Integer, ForeignKey("organizaciones.id"), nullable=False)
    organizacion = relationship("Organizacion")

    # El numero_documento ya no es unique a nivel global:
    numero_documento = Column(String(50), nullable=False)

    nombre_razon_social = Column(String(100), nullable=False)
    email = Column(String(100), nullable=True)
    pagina_web = Column(String(255), nullable=True)

    # Ubicación
    departamento_id = Column(Integer, ForeignKey("departamentos.id"), nullable=False)
    departamento = relationship("Departamento")

    ciudad_id = Column(Integer, ForeignKey("ciudades.id"), nullable=False)
    ciudad = relationship("Ciudad")

    direccion = Column(String(255), nullable=False)
    telefono1 = Column(String(20), nullable=True)
    telefono2 = Column(String(20), nullable=True)
    celular = Column(String(20), nullable=True)
    whatsapp = Column(String(20), nullable=True)

    # Más catálogos
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

    tipo_marketing_id = Column(Integer, ForeignKey("tipos_marketing.id"), nullable=True)
    tipo_marketing = relationship("TipoMarketing")

    # Referencia a sucursal => ojo con la nueva "sucursales"
    sucursal_id = Column(Integer, ForeignKey("sucursales.id"), nullable=True)
    sucursal = relationship("Sucursal")

    ruta_logistica_id = Column(Integer, ForeignKey("rutas_logisticas.id"), nullable=True)
    ruta_logistica = relationship("RutaLogistica")

    # Vendedor => Empleado
    vendedor_id = Column(Integer, ForeignKey("empleados.id"), nullable=True)
    vendedor = relationship("Empleado")

    observacion = Column(String(255), nullable=True)

    # Unicidad => un cliente con numero_documento X no se repite dentro de la misma organizacion
    __table_args__ = (
        UniqueConstraint("organizacion_id", "numero_documento", name="uq_cliente_org_doc"),
    )

    @validates("numero_documento")
    def validate_numero_documento(self, key, value):
        """
        Ejemplo: cada vez que se asigna el numero_documento,
        si es NIT, calculamos el DV automáticamente.
        """
        if value:
            # Llamamos a la lógica DV (sin la BD, 
            # asumimos if self.tipo_documento_id == 2 => NIT).
            computed_dv = calc_dv_if_nit(self.tipo_documento_id, value)
            if computed_dv:
                self.dv = computed_dv
        return value

    def __repr__(self):
        return f"<Cliente id={self.id} documento={self.numero_documento} org={self.organizacion_id}>"
