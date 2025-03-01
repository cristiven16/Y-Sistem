# models/empresa.py (ejemplo de archivo unificado)
from sqlalchemy import (
    Column,
    Integer,
    String,
    Enum,
    Boolean,
    DateTime,
    func,
    ForeignKey
)
from sqlalchemy.orm import relationship, validates
import enum

from . import Base  # Asumiendo tu __init__.py define Base
from services.dv_calculator import calc_dv_if_nit

class EstadoOrganizacion(str, enum.Enum):
    activo = "activo"
    inactivo = "inactivo"

class Organizacion(Base):
    __tablename__ = "organizaciones"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)

    # Relación a tipo_documento (tabla "tipo_documento")
    tipo_documento_id = Column(Integer, ForeignKey("tipo_documento.id"), nullable=True)
    # Cuando sea NIT, calcularemos dv
    dv = Column(String(5), nullable=True)  # dígito de verificación (máx 5 por si se extiende, normalmente 1)

    numero_documento = Column(String, nullable=True)
    nombre_fiscal = Column(String, nullable=False)
    nombre_comercial = Column(String, nullable=True)
    nombre_corto = Column(String, nullable=True)

    obligado_contabilidad = Column(Boolean, default=False)
    estado = Column(Enum(EstadoOrganizacion), default=EstadoOrganizacion.activo, nullable=False)

    email_principal = Column(String, nullable=False)
    email_alertas_facturacion = Column(String, nullable=True)
    email_alertas_soporte = Column(String, nullable=True)
    celular_whatsapp = Column(String, nullable=True)
    pagina_web = Column(String, nullable=True)

    # Config encabezado
    encabezado_personalizado = Column(String, nullable=True)

    # Ajustes
    dias_dudoso_recaudo = Column(Integer, default=0)
    recibir_copia_email_documentos_electronicos = Column(Boolean, default=False)
    politica_garantias = Column(String, nullable=True)

    fecha_creacion = Column(DateTime(timezone=True), server_default=func.now())
    fecha_actualizacion = Column(DateTime(timezone=True), onupdate=func.now())

    # Relaciones con Numeraciones, Sucursales, etc.
    numeraciones = relationship("NumeracionTransaccion", back_populates="organizacion", cascade="all, delete-orphan")
    sucursales = relationship("Sucursal", back_populates="organizacion", cascade="all, delete-orphan")
    tiendas_virtuales = relationship("TiendaVirtual", back_populates="organizacion", cascade="all, delete-orphan")
    bodegas = relationship("Bodega", back_populates="organizacion", cascade="all, delete-orphan")
    centros_costos = relationship("CentroCosto", back_populates="organizacion", cascade="all, delete-orphan")
    cajas = relationship("Caja", back_populates="organizacion", cascade="all, delete-orphan")
    cuentas_bancarias = relationship("CuentaBancaria", back_populates="organizacion", cascade="all, delete-orphan")

    # (Si ya tienes roles, usuarios, etc.)
    roles = relationship("Rol", back_populates="organizacion")
    usuarios = relationship("Usuario", back_populates="organizacion")

    @validates('numero_documento')
    def validate_nit(self, key, value):
        """
        Cada vez que se asigne un número de documento, 
        si el tipo_documento es NIT, calculamos dv automáticamente.
        """
        # Verificar si el tipo_documento_id apunta a un registro con abreviatura = 'NIT'.
        # Podrías hacer un query aquí, o con un lazy approach. 
        # O simplemente asumes que si 'tipo_documento_id' == X => 'NIT'
        # Por simplicidad, iremos con un approach minimal:
        # (En la vida real, necesitarías un approach distinto, 
        #  pues validate no te da acceso directo a la DB, 
        #  salvo que manejes session object. 
        #  A veces conviene hacerlo en la capa de servicios.)
        #
        # Ejemplo heurístico: si ya se seteo un 'dv' => recalcula
        if value and self.tipo_documento_id:  
            # Podrías usar un "if is_nit(self.tipo_documento_id):"
            # Asumamos '2 = NIT' (por ejemplo), ajústalo a tu gusto
            if self.tipo_documento_id == 2:  
                # calculamos dv
                computed_dv = calc_dv_nit(value)
                self.dv = computed_dv
        return value

    def __repr__(self):
        return f"<Organizacion id={self.id} fiscal={self.nombre_fiscal}>"


class NumeracionTransaccion(Base):
    """
    Tabla para manejar resoluciones de facturación y numeración 
    de documentos en la organización.
    """
    __tablename__ = "numeraciones_transaccion"

    id = Column(Integer, primary_key=True, autoincrement=True)
    organizacion_id = Column(Integer, ForeignKey("organizaciones.id"), nullable=False)

    tipo_transaccion = Column(String, nullable=True)  # Ej. "Factura", "Nota Crédito", etc.
    nombre_personalizado = Column(String, nullable=False)
    titulo_transaccion = Column(String, nullable=False)
    mostrar_info_numeracion = Column(Boolean, default=True)
    separador_prefijo = Column(String, nullable=False, default="") 
    # podría ser "Ninguno", "-", " " etc.
    titulo_numeracion = Column(String, nullable=True, default="No.")
    longitud_numeracion = Column(Integer, nullable=True)
    numeracion_por_defecto = Column(Boolean, default=False)
    numero_resolucion = Column(String, nullable=True)
    fecha_expedicion = Column(DateTime(timezone=True), nullable=True)
    fecha_vencimiento = Column(DateTime(timezone=True), nullable=True)
    prefijo = Column(String, nullable=True)
    numeracion_inicial = Column(Integer, nullable=False)
    numeracion_final = Column(Integer, nullable=False)
    numeracion_siguiente = Column(Integer, nullable=False)
    total_maximo_por_transaccion = Column(Integer, nullable=True)  # sin límite si None
    transaccion_electronica = Column(Boolean, default=False)

    organizacion = relationship("Organizacion", back_populates="numeraciones")

    # Podrías agregar fecha_creacion, etc., si deseas

class Sucursal(Base):
    __tablename__ = "sucursales"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    organizacion_id = Column(Integer, ForeignKey("organizaciones.id"), nullable=False)

    nombre = Column(String, nullable=False)  # Por defecto: "Principal"
    pais = Column(String, nullable=True)     # Si no tienes tabla 'paises'
    departamento_id = Column(Integer, ForeignKey("departamentos.id"), nullable=True)
    ciudad_id = Column(Integer, ForeignKey("ciudades.id"), nullable=True)
    direccion = Column(String, nullable=True)
    telefonos = Column(String, nullable=True)

    prefijo_transacciones = Column(String, nullable=True)

    sucursal_principal = Column(Boolean, default=False)
    activa = Column(Boolean, default=True)

    organizacion = relationship("Organizacion", back_populates="sucursales")
    departamento = relationship("Departamento", lazy="joined")
    ciudad = relationship("Ciudad", lazy="joined")

    def __repr__(self):
        return f"<Sucursal id={self.id} nombre={self.nombre}>"

class TiendaVirtual(Base):
    __tablename__ = "tiendas_virtuales"

    id = Column(Integer, primary_key=True, autoincrement=True)
    organizacion_id = Column(Integer, ForeignKey("organizaciones.id"), nullable=False)

    plataforma = Column(String, nullable=True)  # Ej. "Shopify", "WooCommerce", etc.
    nombre = Column(String, nullable=False)
    url = Column(String, nullable=True)
    # Centro de costos
    centro_costo_id = Column(Integer, ForeignKey("centros_costos.id"), nullable=True)

    estado = Column(Boolean, default=True)

    organizacion = relationship("Organizacion", back_populates="tiendas_virtuales")
    centro_costo = relationship("CentroCosto", back_populates="tiendas_virtuales", lazy="joined")


class Bodega(Base):
    __tablename__ = "bodegas"

    id = Column(Integer, primary_key=True, autoincrement=True)
    organizacion_id = Column(Integer, ForeignKey("organizaciones.id"), nullable=False)
    sucursal_id = Column(Integer, ForeignKey("sucursales.id"), nullable=False)

    nombre = Column(String, nullable=False)
    bodega_por_defecto = Column(Boolean, default=False)
    estado = Column(Boolean, default=True)

    organizacion = relationship("Organizacion", back_populates="bodegas")
    sucursal = relationship("Sucursal", lazy="joined")

class CentroCosto(Base):
    __tablename__ = "centros_costos"

    id = Column(Integer, primary_key=True, autoincrement=True)
    organizacion_id = Column(Integer, ForeignKey("organizaciones.id"), nullable=False)

    codigo = Column(String, nullable=False, unique=True)
    nombre = Column(String, nullable=False)
    nivel = Column(String, nullable=True)  # "PRINCIPAL" o "SUBCENTRO"
    padre_id = Column(Integer, ForeignKey("centros_costos.id"), nullable=True)
    permite_ingresos = Column(Boolean, default=True)
    estado = Column(Boolean, default=True)

    organizacion = relationship("Organizacion", back_populates="centros_costos")
    # Relación recursiva
    padre = relationship("CentroCosto", remote_side=[id], lazy="joined")
    # Una lista de subcentros
    # subcentros = relationship("CentroCosto", backref=backref("padre_costo", remote_side=[id]))

    # Podrías también manejar cascadas recursivas

class Caja(Base):
    __tablename__ = "cajas"

    id = Column(Integer, primary_key=True, autoincrement=True)
    organizacion_id = Column(Integer, ForeignKey("organizaciones.id"), nullable=False)

    nombre = Column(String, nullable=False)
    sucursal_id = Column(Integer, ForeignKey("sucursales.id"), nullable=False)

    estado = Column(Boolean, default=True)
    vigencia = Column(Boolean, default=True)

    fecha_creacion = Column(DateTime(timezone=True), server_default=func.now())
    responsable_creacion = Column(Integer, nullable=True)  # Podrías referenciar al user ID
    fecha_modificacion = Column(DateTime(timezone=True), onupdate=func.now())
    responsable_modificacion = Column(Integer, nullable=True)
    fecha_anulacion = Column(DateTime(timezone=True), nullable=True)
    responsable_anulacion = Column(Integer, nullable=True)

    organizacion = relationship("Organizacion", back_populates="cajas")
    sucursal = relationship("Sucursal", lazy="joined")


class CuentaBancaria(Base):
    __tablename__ = "cuentas_bancarias"

    id = Column(Integer, primary_key=True, autoincrement=True)
    organizacion_id = Column(Integer, ForeignKey("organizaciones.id"), nullable=False)

    # Tipo de documento del titular
    tipo_documento_id = Column(Integer, ForeignKey("tipo_documento.id"), nullable=True)
    numero_documento_titular = Column(String, nullable=True)
    titular = Column(String, nullable=False)  # Nombre de la persona/empresa titular
    banco = Column(String, nullable=False)
    swift_bic = Column(String, nullable=True)
    direccion_banco = Column(String, nullable=True)

    # Tipo cuenta => Podrías crear otra tabla "tipos_cuenta"
    tipo_cuenta = Column(String, nullable=True)  # "Ahorros", "Corriente", etc.

    # Divisa => foreign key a "monedas"
    divisa_id = Column(Integer, ForeignKey("monedas.id"), nullable=True)

    estado = Column(Boolean, default=True)
    vigencia = Column(Boolean, default=True)

    fecha_creacion = Column(DateTime(timezone=True), server_default=func.now())
    responsable_creacion = Column(Integer, nullable=True)
    fecha_modificacion = Column(DateTime(timezone=True), onupdate=func.now())
    responsable_modificacion = Column(Integer, nullable=True)
    fecha_anulacion = Column(DateTime(timezone=True), nullable=True)
    responsable_anulacion = Column(Integer, nullable=True)

    organizacion = relationship("Organizacion", back_populates="cuentas_bancarias")
    tipo_documento_rel = relationship("TipoDocumento", lazy="joined")
    divisa_rel = relationship("Moneda", lazy="joined")

    #plan
    plan_id = Column(Integer, ForeignKey("planes.id"), nullable=True)
    fecha_inicio_plan = Column(DateTime(timezone=True), nullable=True)
    fecha_fin_plan = Column(DateTime(timezone=True), nullable=True)
    trial_activo = Column(Boolean, default=False)

    plan = relationship("Plan", back_populates="organizaciones")
