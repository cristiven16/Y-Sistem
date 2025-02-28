# common_schemas.py
from pydantic import BaseModel

class TipoDocumentoSchema(BaseModel):
    id: int
    nombre: str
    abreviatura: str

    class Config:
        from_attributes = True

class DepartamentoSchema(BaseModel):
    id: int
    nombre: str

    class Config:
        from_attributes = True

class CiudadSchema(BaseModel):
    id: int
    nombre: str

    class Config:
        from_attributes = True
