# gestion_negocio/models/roles.py

from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, func
from sqlalchemy.orm import relationship
from . import Base
from .permissions import Permission, role_permissions  # <--- Importa tu pivot y modelo Permission

class Rol(Base):
    __tablename__ = "roles"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    organizacion_id = Column(Integer, ForeignKey("organizaciones.id"), nullable=True)

    nombre = Column(String, nullable=False)
    descripcion = Column(String, nullable=True)
    nivel = Column(Integer, nullable=False, default=999)
    fecha_creacion = Column(DateTime(timezone=True), server_default=func.now())

    # Relación con organización (si el rol pertenece a una org específica)
    organizacion = relationship("Organizacion", back_populates="roles")

    # Relación con usuarios (cada usuario tiene un rol_id)
    usuarios = relationship("Usuario", back_populates="rol")

    # Relación many-to-many con Permission
    # 'role_permissions' es la tabla pivote definida en 'permissions.py'
    permissions = relationship(
        Permission,
        secondary=role_permissions,
        back_populates="roles"
    )

    def __repr__(self):
        return f"<Rol id={self.id} nombre={self.nombre} nivel={self.nivel} org_id={self.organizacion_id}>"
