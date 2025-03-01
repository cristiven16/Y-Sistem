from sqlalchemy import Column, Integer, String, Float, DateTime, func, Boolean
from sqlalchemy.orm import relationship
from . import Base

class Plan(Base):
    __tablename__ = "planes"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    nombre_plan = Column(String, nullable=False, unique=True)

    # Límites
    max_usuarios = Column(Integer, default=10)
    max_empleados = Column(Integer, default=0)
    max_sucursales = Column(Integer, default=1)

    # Características del plan
    precio = Column(Float, nullable=True)
    soporte_prioritario = Column(Boolean, default=False)
    uso_ilimitado_funciones = Column(Boolean, default=True)
    duracion_dias = Column(Integer, nullable=True)

    fecha_creacion = Column(DateTime(timezone=True), server_default=func.now())

    def __repr__(self):
        return f"<Plan id={self.id} nombre={self.nombre_plan}>"
    
    organizaciones = relationship("Organizacion", back_populates="plan")