# schemas/user_schemas.py

from pydantic import BaseModel, EmailStr
from typing import Optional, List
from enum import Enum

class EstadoUsuario(str, Enum):
    activo = "activo"
    bloqueado = "bloqueado"
    inactivo = "inactivo"

class UserBase(BaseModel):
    nombre: str
    email: EmailStr

class UserCreate(UserBase):
    password: str
    rol_id: Optional[int] = None
    organizacion_id: Optional[int] = None

class UserUpdate(BaseModel):
    """
    Esquema para actualizaciones parciales.
    Todos los campos son opcionales, 
    y solo se actualizarán si están presentes.
    """
    nombre: Optional[str] = None
    email: Optional[EmailStr] = None
    password: Optional[str] = None
    rol_id: Optional[int] = None
    organizacion_id: Optional[int] = None
    estado: Optional[EstadoUsuario] = None
    # "tiene_mfa" o cualquier otro campo que quieras permitir actualizar

class UserRead(BaseModel):
    id: int
    nombre: str
    email: EmailStr
    estado: EstadoUsuario
    rol_id: Optional[int] = None
    organizacion_id: Optional[int] = None
    tiene_mfa: bool

    class Config:
        from_attributes = True

class PaginatedUsers(BaseModel):
    data: List[UserRead]
    page: int
    total_paginas: int
    total_registros: int

    class Config:
        from_attributes = True

class UserReadExtended(UserRead):
    rol_nombre: Optional[str] = None