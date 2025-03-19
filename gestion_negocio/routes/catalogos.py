from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from database import get_db
from models.catalogos import (
    TipoDocumento,
    RegimenTributario,
    TipoPersona,
    Moneda,
    TarifaPrecios,
    ActividadEconomica,
    FormaPago,
    Retencion,
    TipoMarketing,
    RutaLogistica
)
# (Opcional) Importas si requieres validación de usuario
# from dependencies.auth import get_current_user

router = APIRouter(prefix="/catalogos", tags=["Catálogos"])


@router.get("/tipos-documento")
async def obtener_tipos_documento(db: AsyncSession = Depends(get_db)):
    stmt = select(TipoDocumento)
    result = await db.execute(stmt)
    return result.scalars().all()


@router.get("/regimenes-tributarios")
async def obtener_regimenes_tributarios(db: AsyncSession = Depends(get_db)):
    stmt = select(RegimenTributario)
    result = await db.execute(stmt)
    return result.scalars().all()


@router.get("/tipos-persona")
async def obtener_tipos_persona(db: AsyncSession = Depends(get_db)):
    stmt = select(TipoPersona)
    result = await db.execute(stmt)
    return result.scalars().all()


@router.get("/monedas")
async def obtener_monedas(db: AsyncSession = Depends(get_db)):
    stmt = select(Moneda)
    result = await db.execute(stmt)
    return result.scalars().all()


@router.get("/tarifas-precios")
async def obtener_tarifas_precios(db: AsyncSession = Depends(get_db)):
    stmt = select(TarifaPrecios)
    result = await db.execute(stmt)
    return result.scalars().all()


@router.get("/actividades-economicas")
async def obtener_actividades_economicas(db: AsyncSession = Depends(get_db)):
    stmt = select(ActividadEconomica)
    result = await db.execute(stmt)
    return result.scalars().all()


@router.get("/formas-pago")
async def obtener_formas_pago(db: AsyncSession = Depends(get_db)):
    stmt = select(FormaPago)
    result = await db.execute(stmt)
    return result.scalars().all()


@router.get("/retenciones")
async def obtener_retenciones(db: AsyncSession = Depends(get_db)):
    stmt = select(Retencion)
    result = await db.execute(stmt)
    return result.scalars().all()


@router.get("/tipos-marketing")
async def obtener_tipos_marketing(db: AsyncSession = Depends(get_db)):
    stmt = select(TipoMarketing)
    result = await db.execute(stmt)
    return result.scalars().all()


@router.get("/rutas-logisticas")
async def obtener_rutas_logisticas(db: AsyncSession = Depends(get_db)):
    stmt = select(RutaLogistica)
    result = await db.execute(stmt)
    return result.scalars().all()
