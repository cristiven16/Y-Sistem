from sqlalchemy import Column, Integer, String, ForeignKey, Table, DateTime, func
from sqlalchemy.orm import relationship
from . import Base

# Suponiendo que ya tienes "Rol" en models.roles => importalo
# from .roles import Rol

class Permission(Base):
    __tablename__ = "permissions"

    id = Column(Integer, primary_key=True, autoincrement=True)
    nombre = Column(String(50), unique=True, nullable=False)
    descripcion = Column(String(200), nullable=True)

    # Relación muchos-a-muchos con Rol a través de la tabla pivote role_permissions
    # Vamos a definir la relación en la clase Permission
    # Si deseas, también en Rol.

    roles = relationship(
        "Rol",
        secondary="role_permissions",  # nombre de la tabla pivote
        back_populates="permissions"
    )

    def __repr__(self):
        return f"<Permission id={self.id} nombre={self.nombre}>"


# Tabla pivote "role_permissions"
# OJO: en vez de crear un modelo con class, se suele crear una "tabla"
# con 'Table(..., Base.metadata, ...)'. Pero también podrías crear un model.
# Aquí haré la tabla:
# Notar que en la migración definimos las columnas 'role_id' y 'permission_id'.

# Suele definirse en un "models/associations.py" o similar
# pero puedes hacerlo aquí:
# Si ya la creaste en la migración, igual necesitas la definición a nivel SQLAlchemy.
from . import Base

role_permissions = Table(
    "role_permissions",
    Base.metadata,
    Column("role_id", Integer, ForeignKey("roles.id"), primary_key=True),
    Column("permission_id", Integer, ForeignKey("permissions.id"), primary_key=True),
    Column("fecha_creacion", DateTime(timezone=True), server_default=func.now())
)
