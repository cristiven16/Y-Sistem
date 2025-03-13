# gestion_negocio/schemas/role_schemas.py

from pydantic import BaseModel
from typing import Optional, List

class RoleBase(BaseModel):
    nombre: str
    descripcion: Optional[str] = None
    nivel: int = 999  # <= nuevo campo con default

class RoleCreate(RoleBase):
    organizacion_id: Optional[int] = None

class RoleRead(RoleBase):
    id: int
    organizacion_id: Optional[int]

    # Para convertir automáticamente al serializar (usado con SQLAlchemy)
    class Config:
        from_attributes = True

class PaginatedRoles(BaseModel):
    """
    Clase para retornar los roles en una estructura de paginación.
    """
    data: List[RoleRead]
    page: int
    total_paginas: int
    total_registros: int
