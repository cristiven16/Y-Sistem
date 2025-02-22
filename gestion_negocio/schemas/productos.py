from pydantic import BaseModel
from typing import Optional
from decimal import Decimal

class ProductoSchema(BaseModel):
    nombre: str
    codigo_barras: Optional[str] = None
    categoria_id: int
    precio: Decimal
    stock: int
    unidad_medida: str
    datos_adicionales: Optional[dict] = None

class ProductoResponseSchema(ProductoSchema):
    id: int

    class Config:
        from_attributes = True
