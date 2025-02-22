from sqlalchemy import Column, Integer, String, Numeric, DateTime
from sqlalchemy.sql import func
from database import Base

class Transaccion(Base):
    __tablename__ = "transacciones"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)  # ✅ Ahora usa SERIAL
    tipo = Column(String, nullable=False)
    monto = Column(Numeric(10, 2), nullable=False)
    descripcion = Column(String, nullable=True)
    fecha = Column(DateTime, default=func.now())
