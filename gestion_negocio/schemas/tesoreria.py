from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class TransaccionSchema(BaseModel):
    tipo: str
    monto: float
    descripcion: Optional[str] = None

class TransaccionResponseSchema(TransaccionSchema):
    id: int  # ⚠️ Antes era UUID, ahora es int
    fecha: datetime
