from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models.planes import Plan
from schemas.plan_schemas import PlanCreate, PlanRead
from dependencies.auth import get_current_user

router = APIRouter(prefix="/planes", tags=["Planes"], dependencies=[Depends(get_current_user)])

@router.post("/", response_model=PlanRead)
def create_plan(data: PlanCreate, db: Session = Depends(get_db)):
    plan = Plan(
        nombre_plan=data.nombre_plan,
        max_usuarios=data.max_usuarios,
        max_empleados=data.max_empleados,
        max_sucursales=data.max_sucursales,
        precio=data.precio,
        soporte_prioritario=data.soporte_prioritario,
        uso_ilimitado_funciones=data.uso_ilimitado_funciones,
        duracion_dias=data.duracion_dias
    )
    db.add(plan)
    db.commit()
    db.refresh(plan)
    return plan

@router.get("/", response_model=list[PlanRead])
def list_planes(db: Session = Depends(get_db)):
    planes = db.query(Plan).all()
    return planes

@router.get("/{plan_id}", response_model=PlanRead)
def get_plan(plan_id: int, db: Session = Depends(get_db)):
    plan = db.query(Plan).filter(Plan.id == plan_id).first()
    if not plan:
        raise HTTPException(status_code=404, detail="Plan no encontrado")
    return plan

@router.put("/{plan_id}", response_model=PlanRead)
def update_plan(plan_id: int, data: PlanCreate, db: Session = Depends(get_db)):
    plan = db.query(Plan).filter(Plan.id == plan_id).first()
    if not plan:
        raise HTTPException(status_code=404, detail="Plan no encontrado")
    plan.nombre_plan = data.nombre_plan
    plan.max_usuarios = data.max_usuarios
    plan.max_empleados = data.max_empleados
    plan.max_sucursales = data.max_sucursales
    plan.precio = data.precio
    plan.soporte_prioritario = data.soporte_prioritario
    plan.uso_ilimitado_funciones = data.uso_ilimitado_funciones
    plan.duracion_dias = data.duracion_dias
    db.commit()
    db.refresh(plan)
    return plan

@router.delete("/{plan_id}")
def delete_plan(plan_id: int, db: Session = Depends(get_db)):
    plan = db.query(Plan).filter(Plan.id == plan_id).first()
    if not plan:
        raise HTTPException(status_code=404, detail="Plan no encontrado")
    db.delete(plan)
    db.commit()
    return {"message": f"Plan {plan_id} eliminado"}
