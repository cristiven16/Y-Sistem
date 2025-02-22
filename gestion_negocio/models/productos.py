from sqlalchemy import Column, Integer, String, Numeric, ForeignKey
from database import Base

class Producto(Base):
    __tablename__ = "productos"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, nullable=False)
    codigo_barras = Column(String, unique=True, nullable=True)
    categoria_id = Column(Integer, ForeignKey("categorias.id"))
    precio = Column(Numeric(10, 2), nullable=False)
    stock = Column(Integer, nullable=False)
    unidad_medida = Column(String, nullable=False)
    datos_adicionales = Column(String, nullable=True)
