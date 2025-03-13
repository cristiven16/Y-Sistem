# gestion_negocio/schemas/permission_schemas.py

from pydantic import BaseModel
from typing import Optional, List

class PermissionBase(BaseModel):
    nombre: str
    descripcion: Optional[str] = None

class PermissionCreate(PermissionBase):
    """
    Para crear un nuevo permiso (POST /permissions).
    Si deseas más campos, agrégalos.
    """
    pass

class PermissionRead(PermissionBase):
    """
    Para retornar un permiso al frontend.
    Incluye el 'id'.
    """
    id: int

    class Config:
        # Para Pydantic v1
        # orm_mode = True
        
        # Para Pydantic v2:
        from_attributes = True

class PaginatedPermissions(BaseModel):
    """
    Estructura para listar permisos con paginación:
    {
      "data": [...],
      "page": 1,
      "total_paginas": 3,
      "total_registros": 25
    }
    """
    data: List[PermissionRead]
    page: int
    total_paginas: int
    total_registros: int

    class Config:
        # Para Pydantic v1:
        # orm_mode = True

        # Para Pydantic v2:
        from_attributes = True
