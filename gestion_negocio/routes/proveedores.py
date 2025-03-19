# gestion_negocio/routes/proveedores.py

from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload
from database import get_db
from schemas.proveedores import (
    ProveedorSchema,
    ProveedorResponseSchema,
    ProveedorUpdateSchema,
    PaginatedProveedores
)
from models.proveedores import Proveedor
from dependencies.auth import get_current_user
from services.dv_calculator import calc_dv_if_nit


router = APIRouter(prefix="/proveedores", tags=["Proveedores"], dependencies=[Depends(get_current_user)])


def normalize_text(text: str) -> str:
    """
    Reemplaza vocales acentuadas por vocales sin tilde.
    """
    return (
        text.replace("á", "a")
            .replace("é", "e")
            .replace("í", "i")
            .replace("ó", "o")
            .replace("ú", "u")
    )


@router.post("/", response_model=dict)
async def crear_proveedor(proveedor: ProveedorSchema, db: AsyncSession = Depends(get_db)):
    """
    Crea un nuevo proveedor, recibiendo todos los campos requeridos en ProveedorSchema.
    """
    # 1) Normalizar
    proveedor.nombre_razon_social = proveedor.nombre_razon_social.upper()
    proveedor.numero_documento = normalize_text(proveedor.numero_documento).strip()

    # 2) Verificar duplicado en la misma organización
    stmt_duplicado = select(Proveedor).where(
        Proveedor.organizacion_id == proveedor.organizacion_id,
        Proveedor.numero_documento == proveedor.numero_documento
    )
    result_dup = await db.execute(stmt_duplicado)
    existe_prov = result_dup.scalars().first()
    if existe_prov:
        raise HTTPException(
            status_code=400,
            detail="El número de identificación ya está registrado en esta organización."
        )

    # 3) Calcular DV si es NIT
    dv_calculado = calc_dv_if_nit(proveedor.tipo_documento_id, proveedor.numero_documento)

    # 4) Crear y guardar
    nuevo_proveedor = Proveedor(
        organizacion_id=proveedor.organizacion_id,
        tipo_documento_id=proveedor.tipo_documento_id,
        dv=dv_calculado,
        numero_documento=proveedor.numero_documento,
        nombre_razon_social=proveedor.nombre_razon_social,
        email=proveedor.email,
        pagina_web=proveedor.pagina_web,
        departamento_id=proveedor.departamento_id,
        ciudad_id=proveedor.ciudad_id,
        direccion=proveedor.direccion,
        telefono1=proveedor.telefono1,
        telefono2=proveedor.telefono2,
        celular=proveedor.celular,
        whatsapp=proveedor.whatsapp,
        tipos_persona_id=proveedor.tipos_persona_id,
        regimen_tributario_id=proveedor.regimen_tributario_id,
        moneda_principal_id=proveedor.moneda_principal_id,
        tarifa_precios_id=proveedor.tarifa_precios_id,
        actividad_economica_id=proveedor.actividad_economica_id,
        forma_pago_id=proveedor.forma_pago_id,
        retencion_id=proveedor.retencion_id,
        permitir_venta=proveedor.permitir_venta,
        descuento=proveedor.descuento,
        cupo_credito=proveedor.cupo_credito,
        sucursal_id=proveedor.sucursal_id,
        observacion=proveedor.observacion
    )

    db.add(nuevo_proveedor)
    await db.commit()
    await db.refresh(nuevo_proveedor)

    return {
        "message": "Proveedor creado con éxito",
        "id": nuevo_proveedor.id,
        "numero_documento": nuevo_proveedor.numero_documento
    }


@router.get("/", response_model=PaginatedProveedores)
async def obtener_proveedores(
    db: AsyncSession = Depends(get_db),
    search: Optional[str] = Query(None, description="Texto de búsqueda"),
    page: int = Query(1, ge=1, description="Número de página"),
    page_size: int = 10
):
    """
    Retorna una lista paginada de proveedores, permitiendo búsqueda parcial en 'nombre_razon_social'.
    """
    stmt_base = (
        select(Proveedor)
        .options(
            joinedload(Proveedor.departamento),
            joinedload(Proveedor.ciudad)
        )
    )

    # Búsqueda parcial
    if search:
        normalized = normalize_text(search).strip().lower()
        terms = normalized.split()
        for term in terms:
            stmt_base = stmt_base.where(
                func.lower(Proveedor.nombre_razon_social).ilike(f"%{term}%")
            )

    # Contar total
    count_stmt = stmt_base.with_only_columns(func.count(Proveedor.id))
    total_res = await db.execute(count_stmt)
    total_registros = total_res.scalar() or 0
    total_paginas = max((total_registros + page_size - 1) // page_size, 1)

    if page > total_paginas:
        page = total_paginas

    offset = (page - 1) * page_size
    stmt_paginado = stmt_base.offset(offset).limit(page_size)

    result_proveedores = await db.execute(stmt_paginado)
    proveedores_db = result_proveedores.scalars().all()

    data = [ProveedorResponseSchema.from_orm(p) for p in proveedores_db]
    return {
        "data": data,
        "page": page,
        "total_paginas": total_paginas,
        "total_registros": total_registros
    }


@router.get("/{proveedor_id}", response_model=ProveedorResponseSchema)
async def obtener_proveedor(
    proveedor_id: int,
    db: AsyncSession = Depends(get_db)
):
    """
    Obtiene un proveedor por su ID.
    """
    stmt = select(Proveedor).where(Proveedor.id == proveedor_id)
    result = await db.execute(stmt)
    prov = result.scalars().first()
    if not prov:
        raise HTTPException(status_code=404, detail="Proveedor no encontrado")
    return prov


@router.patch("/{proveedor_id}", response_model=ProveedorResponseSchema)
async def actualizar_proveedor_parcial(
    proveedor_id: int,
    proveedor_data: ProveedorUpdateSchema,
    db: AsyncSession = Depends(get_db)
):
    """
    Actualiza de manera parcial los campos del proveedor (solo los enviados).
    """
    stmt = select(Proveedor).where(Proveedor.id == proveedor_id)
    result = await db.execute(stmt)
    prov_db = result.scalars().first()
    if not prov_db:
        raise HTTPException(status_code=404, detail="Proveedor no encontrado")

    # Convierte a dict, excluyendo campos no enviados
    campos = proveedor_data.dict(exclude_unset=True)

    # Si cambia 'numero_documento'
    if "numero_documento" in campos:
        doc_nuevo = normalize_text(campos["numero_documento"]).strip()
        if doc_nuevo != prov_db.numero_documento:
            # Verificar duplicado en la misma org
            org_id = campos.get("organizacion_id", prov_db.organizacion_id)
            stmt_dup = select(Proveedor).where(
                Proveedor.organizacion_id == org_id,
                Proveedor.numero_documento == doc_nuevo,
                Proveedor.id != prov_db.id
            )
            result_dup = await db.execute(stmt_dup)
            existe = result_dup.scalars().first()
            if existe:
                raise HTTPException(status_code=400, detail="Este documento ya está registrado en la organización.")
            campos["numero_documento"] = doc_nuevo

    # Si cambia 'nombre_razon_social', normalizar
    if "nombre_razon_social" in campos and campos["nombre_razon_social"]:
        campos["nombre_razon_social"] = campos["nombre_razon_social"].upper()

    # Recalcular DV si cambian tipo_documento_id o numero_documento
    if "tipo_documento_id" in campos or "numero_documento" in campos:
        tdoc = campos.get("tipo_documento_id", prov_db.tipo_documento_id)
        ndoc = campos.get("numero_documento", prov_db.numero_documento)
        dv_calc = calc_dv_if_nit(tdoc, ndoc)
        if dv_calc:
            prov_db.dv = dv_calc

    # Asignar campos
    for key, value in campos.items():
        setattr(prov_db, key, value)

    await db.commit()
    await db.refresh(prov_db)
    return prov_db


@router.delete("/{proveedor_id}")
async def eliminar_proveedor(
    proveedor_id: int,
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Proveedor).where(Proveedor.id == proveedor_id)
    result = await db.execute(stmt)
    prov_db = result.scalars().first()
    if not prov_db:
        raise HTTPException(status_code=404, detail="Proveedor no encontrado")

    await db.delete(prov_db)
    await db.commit()
    return {"message": "Proveedor eliminado correctamente"}
