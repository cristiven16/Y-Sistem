from pydantic import BaseModel, EmailStr, Field

class UsuarioRegistro(BaseModel):
    nombre: str
    email: EmailStr
    password: str
    rol: str
    es_admin: bool = False

class UsuarioLogin(BaseModel):
    email: EmailStr = Field(..., alias="username")
    password: str

class UsuarioResponse(BaseModel):
    id: int  # ⚠️ Antes era UUID, ahora es int
    nombre: str
    email: EmailStr
    rol: str
    es_admin: bool
