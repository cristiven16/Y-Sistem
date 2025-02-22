from pydantic import BaseModel
from typing import List, Optional
from decimal import Decimal
from datetime import datetime

class VentaSchema(BaseModel):
    cliente_id: int
    total: Decimal

class VentaResponseSchema(VentaSchema):
    id: int
    fecha: datetime

    class Config:
        from_attributes = True

class PedidoCreateSchema(BaseModel):
    cliente_id: int
    productos: List[int]
    estado: Optional[str] = "pendiente"  # ✅ Asegurar que el campo estado está definido

class PedidoResponseSchema(PedidoCreateSchema):
    id: int
    fecha: datetime

    class Config:
        from_attributes = True
