from sqlalchemy import Column, Integer, Numeric, DateTime, ForeignKey, String
from sqlalchemy.orm import relationship
from database import Base
import datetime

class Venta(Base):
    __tablename__ = "ventas"

    id = Column(Integer, primary_key=True, index=True)
    cliente_id = Column(Integer, ForeignKey("usuarios.id"))
    total = Column(Numeric(10, 2), nullable=False)
    estado = Column(String, default="pendiente")  # ✅ Estados de la orden de venta
    fecha = Column(DateTime, default=datetime.datetime.utcnow)

    cliente = relationship("Usuario")

class DetalleVenta(Base):
    __tablename__ = "detalles_venta"

    id = Column(Integer, primary_key=True, index=True)
    venta_id = Column(Integer, ForeignKey("ventas.id"))
    producto_id = Column(Integer, ForeignKey("productos.id"))
    cantidad = Column(Integer, nullable=False)
    precio_unitario = Column(Numeric(10, 2), nullable=False)

    venta = relationship("Venta")
    producto = relationship("Producto")
