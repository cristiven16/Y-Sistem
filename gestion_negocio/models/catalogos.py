from sqlalchemy import Column, Integer, String, Numeric
from database import Base

# 📌 Tipo de Documento
class TipoDocumento(Base):
    __tablename__ = "tipo_documento"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    nombre = Column(String, unique=True, nullable=False)
    abreviatura = Column(String, unique=True, nullable=False)

# 📌 Régimen Tributario
class RegimenTributario(Base):
    __tablename__ = "regimen_tributario"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    nombre = Column(String, unique=True, nullable=False)

# 📌 Tipo de Cliente
class TipoPersona(Base):
    __tablename__ = "tipos_persona"
    id = Column(Integer, primary_key=True, autoincrement=True)
    nombre = Column(String(100), unique=True, nullable=False)

# 📌 Moneda Principal
class Moneda(Base):
    __tablename__ = "monedas"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    codigo = Column(String, unique=True, nullable=False)
    nombre = Column(String(50), unique=True, nullable=False)

# 📌 Tarifa de Precios
class TarifaPrecios(Base):
    __tablename__ = "tarifa_precios"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    nombre = Column(String, unique=True, nullable=False)

# 📌 Actividad Económica CIIU
class ActividadEconomica(Base):
    __tablename__ = "actividades_economicas"
    id = Column(Integer, primary_key=True, autoincrement=True)
    nombre = Column(String(100), unique=True, nullable=False)

# 📌 Forma de Pago
class FormaPago(Base):
    __tablename__ = "formas_pago"
    id = Column(Integer, primary_key=True, autoincrement=True)
    nombre = Column(String(100), unique=True, nullable=False)

# 📌 Retención
class Retencion(Base):
    __tablename__ = "retenciones"
    id = Column(Integer, primary_key=True, autoincrement=True)
    nombre = Column(String(100), unique=True, nullable=False)

# 📌 Tipo de Marketing
class TipoMarketing(Base):
    __tablename__ = "tipos_marketing"
    id = Column(Integer, primary_key=True, autoincrement=True)
    nombre = Column(String(100), unique=True, nullable=False)

# 📌 Sucursal
class Sucursal(Base):
    __tablename__ = "sucursal"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    nombre = Column(String, unique=True, nullable=False)

# 📌 Ruta Logística
class RutaLogistica(Base):
    __tablename__ = "rutas_logisticas"
    id = Column(Integer, primary_key=True, autoincrement=True)
    nombre = Column(String(100), unique=True, nullable=False)

# 📌 Vendedor
class Vendedor(Base):
    __tablename__ = "vendedor"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    nombre = Column(String, nullable=False)
    identificacion = Column(String, unique=True, nullable=False)
