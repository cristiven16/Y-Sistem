# schemas/plan_schemas.py
from pydantic import BaseModel
from typing import Optional

class PlanBase(BaseModel):
    nombre_plan: str
    max_usuarios: int = 10
    max_empleados: int = 0
    max_sucursales: int = 1
    precio: Optional[float] = None
    soporte_prioritario: bool = False
    uso_ilimitado_funciones: bool = True
    duracion_dias: Optional[int] = None

class PlanCreate(PlanBase):
    pass

class PlanRead(PlanBase):
    id: int

    class Config:
        from_attributes = True
