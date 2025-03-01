from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, func
from sqlalchemy.orm import relationship
from . import Base

class AuditLog(Base):
    __tablename__ = "auditoria"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    usuario_id = Column(Integer, ForeignKey("usuarios.id"), nullable=True)
    tipo_evento = Column(String, nullable=False)
    detalle = Column(Text, nullable=True)
    ip_origen = Column(String, nullable=True)
    fecha_evento = Column(DateTime(timezone=True), server_default=func.now())

    usuario = relationship("Usuario", back_populates="logs")
