# gestion_negocio/routes/ubicaciones.py

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_db
from models.ubicaciones import Departamento, Ciudad
from dependencies.auth import get_current_user

router = APIRouter(prefix="/ubicaciones", tags=["Ubicaciones"], dependencies=[Depends(get_current_user)])


@router.get("/departamentos")
async def obtener_departamentos(db: AsyncSession = Depends(get_db)):
    """
    Retorna la lista de departamentos.
    """
    stmt = select(Departamento)
    result = await db.execute(stmt)
    departamentos = result.scalars().all()
    return departamentos


@router.get("/ciudades")
async def obtener_ciudades(departamento_id: int = Query(None), db: AsyncSession = Depends(get_db)):
    """
    Retorna la lista de ciudades de un departamento (si se especifica),
    o todas las ciudades si no se envía 'departamento_id'.
    """
    if departamento_id is not None:
        stmt = select(Ciudad).where(Ciudad.departamento_id == departamento_id)
    else:
        stmt = select(Ciudad)

    result = await db.execute(stmt)
    ciudades = result.scalars().all()
    return ciudades
