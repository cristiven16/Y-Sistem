# gestion_negocio/routes/planes.py

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from database import get_db
from models.planes import Plan
from schemas.plan_schemas import PlanCreate, PlanRead
from dependencies.auth import get_current_user, role_required, ROLE_SUPERADMIN

router = APIRouter(
    prefix="/planes",
    tags=["Planes"],
    dependencies=[
        Depends(get_current_user),
        Depends(role_required([ROLE_SUPERADMIN]))
    ]
)


@router.post("/", response_model=PlanRead)
async def create_plan(data: PlanCreate, db: AsyncSession = Depends(get_db)):
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
    await db.commit()
    await db.refresh(plan)
    return plan


@router.get("/", response_model=list[PlanRead])
async def list_planes(db: AsyncSession = Depends(get_db)):
    stmt = select(Plan)
    result = await db.execute(stmt)
    planes = result.scalars().all()
    return planes


@router.get("/{plan_id}", response_model=PlanRead)
async def get_plan(plan_id: int, db: AsyncSession = Depends(get_db)):
    stmt = select(Plan).where(Plan.id == plan_id)
    result = await db.execute(stmt)
    plan = result.scalars().first()
    if not plan:
        raise HTTPException(status_code=404, detail="Plan no encontrado")
    return plan


@router.put("/{plan_id}", response_model=PlanRead)
async def update_plan(plan_id: int, data: PlanCreate, db: AsyncSession = Depends(get_db)):
    stmt = select(Plan).where(Plan.id == plan_id)
    result = await db.execute(stmt)
    plan = result.scalars().first()
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

    await db.commit()
    await db.refresh(plan)
    return plan


@router.delete("/{plan_id}")
async def delete_plan(plan_id: int, db: AsyncSession = Depends(get_db)):
    stmt = select(Plan).where(Plan.id == plan_id)
    result = await db.execute(stmt)
    plan = result.scalars().first()
    if not plan:
        raise HTTPException(status_code=404, detail="Plan no encontrado")

    await db.delete(plan)
    await db.commit()
    return {"message": f"Plan {plan_id} eliminado"}
