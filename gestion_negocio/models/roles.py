from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, func
from sqlalchemy.orm import relationship
from . import Base

class Rol(Base):
    __tablename__ = "roles"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    organizacion_id = Column(Integer, ForeignKey("organizaciones.id"), nullable=True)

    nombre = Column(String, nullable=False)
    descripcion = Column(String, nullable=True)
    fecha_creacion = Column(DateTime(timezone=True), server_default=func.now())

    # Relación con organización (si el rol pertenece a una org específica)
    organizacion = relationship("Organizacion", back_populates="roles")

    # Relación con usuarios (si un usuario tiene un solo rol)
    usuarios = relationship("Usuario", back_populates="rol")

    def __repr__(self):
        return f"<Rol id={self.id} nombre={self.nombre} org_id={self.organizacion_id}>"
