from pydantic import BaseModel
from typing import Optional

class RoleBase(BaseModel):
    nombre: str
    descripcion: Optional[str] = None

class RoleCreate(RoleBase):
    organizacion_id: Optional[int] = None

class RoleRead(RoleBase):
    id: int
    organizacion_id: Optional[int]

    class Config:
        from_attributes = True
