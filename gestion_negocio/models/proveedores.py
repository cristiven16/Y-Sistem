from sqlalchemy import Column, Integer, String, Boolean, Float, ForeignKey
from sqlalchemy.orm import relationship
from database import Base  # Ajusta según la ruta real de tu "database.py"

class Proveedor(Base):
    __tablename__ = "proveedores"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    
    # Similar a 'clientes':
    tipo_documento_id = Column(Integer, ForeignKey("tipo_documento.id"), nullable=False)
    numero_documento = Column(String(50), unique=True, nullable=False)
    nombre_razon_social = Column(String(100), nullable=False)
    email = Column(String(100), nullable=True)
    pagina_web = Column(String(255), nullable=True)

    departamento_id = Column(Integer, ForeignKey("departamentos.id"), nullable=False)
    ciudad_id = Column(Integer, ForeignKey("ciudades.id"), nullable=False)
    direccion = Column(String(255), nullable=False)

    telefono1 = Column(String(20), nullable=True)
    telefono2 = Column(String(20), nullable=True)
    celular = Column(String(20), nullable=True)
    whatsapp = Column(String(20), nullable=True)

    tipos_persona_id = Column(Integer, ForeignKey("tipos_persona.id"), nullable=False)
    regimen_tributario_id = Column(Integer, ForeignKey("regimen_tributario.id"), nullable=False)
    moneda_principal_id = Column(Integer, ForeignKey("monedas.id"), nullable=False)
    tarifa_precios_id = Column(Integer, ForeignKey("tarifa_precios.id"), nullable=False)
    actividad_economica_id = Column(Integer, ForeignKey("actividades_economicas.id"), nullable=True)
    forma_pago_id = Column(Integer, ForeignKey("formas_pago.id"), nullable=False)
    retencion_id = Column(Integer, ForeignKey("retenciones.id"), nullable=True)

    permitir_venta = Column(Boolean, default=True)
    descuento = Column(Float, default=0)
    cupo_credito = Column(Float, default=0)

    # ❌ EXCLUIDO: tipo_marketing_id, ruta_logistica_id, vendedor_id

    sucursal_id = Column(Integer, ForeignKey("sucursal.id"), nullable=False)
    observacion = Column(String(255), nullable=True)

    # Relaciones
    tipo_documento = relationship("TipoDocumento")
    regimen_tributario = relationship("RegimenTributario")
    tipos_persona = relationship("TipoPersona")
    forma_pago = relationship("FormaPago")
    moneda = relationship("Moneda")
    tarifa_precios = relationship("TarifaPrecios")
    departamento = relationship("Departamento")
    ciudad = relationship("Ciudad")
    actividad_economica = relationship("ActividadEconomica")
    retencion = relationship("Retencion")
    sucursal = relationship("Sucursal")
