from sqlalchemy import Column, Integer, String, ForeignKey, Enum, Boolean, DateTime, func
from sqlalchemy.orm import relationship
from . import Base
import enum

class EstadoUsuario(str, enum.Enum):
    activo = "activo"    
    bloqueado = "bloqueado"
    inactivo = "inactivo"

class TipoUsuario(str, enum.Enum):
    superadmin = "superadmin"
    admin = "admin"
    empleado = "empleado"

class Usuario(Base):
    __tablename__ = "usuarios"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    nombre = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    tipo_usuario = Column(Enum(TipoUsuario), default=TipoUsuario.empleado, nullable=False)

    # Referencias a Rol y Organizacion
    rol_id = Column(Integer, ForeignKey("roles.id"), nullable=True)
    organizacion_id = Column(Integer, ForeignKey("organizaciones.id"), nullable=True)

    # Estado y fechas
    estado = Column(Enum(EstadoUsuario), default=EstadoUsuario.activo, nullable=False)
    tiene_mfa = Column(Boolean, default=False)
    fecha_creacion = Column(DateTime(timezone=True), server_default=func.now())
    fecha_actualizacion = Column(DateTime(timezone=True), onupdate=func.now())

    # Relaciones
    rol = relationship("Rol", back_populates="usuarios")
    organizacion = relationship("Organizacion", back_populates="usuarios")
    logs = relationship("AuditLog", back_populates="usuario")

    @property
    def user_level(self) -> int:
            """
            A menor número => mayor poder
            superadmin => 1
            admin => 2
            empleado => 3
            etc.
            """
            if self.tipo_usuario == TipoUsuario.superadmin:
                return 1
            elif self.tipo_usuario == TipoUsuario.admin:
                return 2
            else:
                return 3

    def __repr__(self):
        return f"<Usuario id={self.id} email={self.email} rol_id={self.rol_id}>"

    