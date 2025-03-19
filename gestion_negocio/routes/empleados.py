# gestion_negocio/routes/empleados.py

from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload

from database import get_db
from models.empleados import Empleado
from schemas.empleados import (
    EmpleadoCreateUpdateSchema,
    EmpleadoPatchSchema,         # <-- esquema para patch
    EmpleadoResponseSchema,
    PaginatedEmpleados
)
from dependencies.auth import get_current_user
from services.dv_calculator import calc_dv_if_nit


router = APIRouter(
    prefix="/empleados",
    tags=["Empleados"],
    dependencies=[Depends(get_current_user)]
)

def normalize_text(text: str) -> str:
    return (text.replace("á", "a")
                .replace("é", "e")
                .replace("í", "i")
                .replace("ó", "o")
                .replace("ú", "u"))

# ------------------------------------------------------------------------------
# POST: Crear Empleado
# ------------------------------------------------------------------------------
@router.post("/", response_model=dict)
async def crear_empleado(
    empleado_in: EmpleadoCreateUpdateSchema,
    db: AsyncSession = Depends(get_db)
):
    """
    Crea un empleado con todos los campos obligatorios que define EmpleadoCreateUpdateSchema.
    """
    # 1) Verificar si (org_id, numero_documento) ya existe
    stmt_duplicado = (
        select(Empleado)
        .where(
            Empleado.organizacion_id == empleado_in.organizacion_id,
            Empleado.numero_documento == empleado_in.numero_documento
        )
    )
    result_duplicado = await db.execute(stmt_duplicado)
    duplicado = result_duplicado.scalars().first()
    if duplicado:
        raise HTTPException(
            status_code=400,
            detail="Documento duplicado en la misma organización."
        )

    # 2) Normalizar + mayúsculas
    empleado_in.nombre_razon_social = empleado_in.nombre_razon_social.upper()
    empleado_in.numero_documento = normalize_text(empleado_in.numero_documento).strip()

    # 3) Recalcular DV
    dv_calc = calc_dv_if_nit(
        empleado_in.tipo_documento_id,
        empleado_in.numero_documento
    )

    # 4) Crear instancia
    nuevo = Empleado(
        organizacion_id=empleado_in.organizacion_id,
        tipo_documento_id=empleado_in.tipo_documento_id,
        dv=dv_calc,
        numero_documento=empleado_in.numero_documento,
        nombre_razon_social=empleado_in.nombre_razon_social,
        email=empleado_in.email,
        telefono1=empleado_in.telefono1,
        telefono2=empleado_in.telefono2,
        celular=empleado_in.celular,
        whatsapp=empleado_in.whatsapp,
        tipos_persona_id=empleado_in.tipos_persona_id,
        regimen_tributario_id=empleado_in.regimen_tributario_id,
        moneda_principal_id=empleado_in.moneda_principal_id,
        actividad_economica_id=empleado_in.actividad_economica_id,
        forma_pago_id=empleado_in.forma_pago_id,
        retencion_id=empleado_in.retencion_id,
        departamento_id=empleado_in.departamento_id,
        ciudad_id=empleado_in.ciudad_id,
        direccion=empleado_in.direccion,
        sucursal_id=empleado_in.sucursal_id,
        cargo=empleado_in.cargo,
        fecha_nacimiento=empleado_in.fecha_nacimiento,
        fecha_ingreso=empleado_in.fecha_ingreso,
        activo=empleado_in.activo,
        es_vendedor=empleado_in.es_vendedor,
        observacion=empleado_in.observacion
    )
    db.add(nuevo)
    await db.commit()
    await db.refresh(nuevo)

    return {
        "message": "Empleado creado con éxito",
        "id": nuevo.id,
        "numero_documento": nuevo.numero_documento
    }

# ------------------------------------------------------------------------------
# GET (lista paginada): Empleados
# ------------------------------------------------------------------------------
@router.get("/", response_model=PaginatedEmpleados)
async def obtener_empleados(
    db: AsyncSession = Depends(get_db),
    search: Optional[str] = None,
    es_vendedor: Optional[bool] = None,
    page: int = 1,
    page_size: int = 10
):
    """
    Lista paginada de empleados, con filtro por 'search' y 'es_vendedor'.
    """
    stmt_base = (
        select(Empleado)
        .options(
            selectinload(Empleado.tipo_documento),
            selectinload(Empleado.departamento),
            selectinload(Empleado.ciudad),
        )
    )

    # Filtro por es_vendedor
    if es_vendedor is not None:
        stmt_base = stmt_base.where(Empleado.es_vendedor == es_vendedor)

    # Filtro por search
    if search:
        normalized = normalize_text(search).lower().strip()
        terms = normalized.split()
        for term in terms:
            stmt_base = stmt_base.where(
                func.lower(Empleado.nombre_razon_social).ilike(f"%{term}%")
            )

    # Contar total
    count_stmt = stmt_base.with_only_columns(func.count(Empleado.id))
    total_result = await db.execute(count_stmt)
    total_registros = total_result.scalar() or 0

    total_paginas = max((total_registros + page_size - 1) // page_size, 1)
    if page > total_paginas:
        page = total_paginas

    offset = (page - 1) * page_size
    stmt_paginado = stmt_base.offset(offset).limit(page_size)

    result_empleados = await db.execute(stmt_paginado)
    empleados_db = result_empleados.scalars().all()

    data = [EmpleadoResponseSchema.from_orm(e) for e in empleados_db]

    return {
        "data": data,
        "page": page,
        "total_paginas": total_paginas,
        "total_registros": total_registros
    }

# ------------------------------------------------------------------------------
# GET (detalle): Empleado por ID
# ------------------------------------------------------------------------------
@router.get("/{empleado_id}", response_model=EmpleadoResponseSchema)
async def obtener_empleado(
    empleado_id: int,
    db: AsyncSession = Depends(get_db)
):
    """
    Obtiene un empleado por su ID
    """
    stmt = (
        select(Empleado)
        .where(Empleado.id == empleado_id)
        .options(
            selectinload(Empleado.tipo_documento),
            selectinload(Empleado.departamento),
            selectinload(Empleado.ciudad),
        )
    )
    result = await db.execute(stmt)
    emp = result.scalars().first()
    if not emp:
        raise HTTPException(status_code=404, detail="Empleado no encontrado")
    return emp

# ------------------------------------------------------------------------------
# PUT: Actualizar empleado (completo)
# ------------------------------------------------------------------------------
@router.put("/{empleado_id}", response_model=EmpleadoResponseSchema)
async def actualizar_empleado_completo(
    empleado_id: int,
    emp_in: EmpleadoCreateUpdateSchema,
    db: AsyncSession = Depends(get_db)
):
    """
    Actualiza TODOS los campos de un empleado (PUT).
    """
    # 1) Consulta inicial (sin relaciones o con las mínimas)
    stmt_get = select(Empleado).where(Empleado.id == empleado_id)
    result = await db.execute(stmt_get)
    emp_db = result.scalars().first()
    if not emp_db:
        raise HTTPException(status_code=404, detail="Empleado no encontrado")

    # 2) Validar duplicado de documento (si lo cambian)
    if emp_in.numero_documento != emp_db.numero_documento:
        stmt_dup = select(Empleado).where(
            Empleado.organizacion_id == emp_in.organizacion_id,
            Empleado.numero_documento == emp_in.numero_documento,
            Empleado.id != empleado_id
        )
        result_dup = await db.execute(stmt_dup)
        duplicado = result_dup.scalars().first()
        if duplicado:
            raise HTTPException(
                status_code=400,
                detail="Documento duplicado en la misma organización."
            )

    # 3) Normalizar + DV
    emp_in.nombre_razon_social = emp_in.nombre_razon_social.upper()
    emp_in.numero_documento = normalize_text(emp_in.numero_documento).strip()
    dv_calc = calc_dv_if_nit(emp_in.tipo_documento_id, emp_in.numero_documento)

    # 4) Asignar
    emp_db.organizacion_id = emp_in.organizacion_id
    emp_db.tipo_documento_id = emp_in.tipo_documento_id
    emp_db.dv = dv_calc
    emp_db.numero_documento = emp_in.numero_documento
    emp_db.nombre_razon_social = emp_in.nombre_razon_social
    emp_db.email = emp_in.email
    emp_db.telefono1 = emp_in.telefono1
    emp_db.telefono2 = emp_in.telefono2
    emp_db.celular = emp_in.celular
    emp_db.whatsapp = emp_in.whatsapp
    emp_db.tipos_persona_id = emp_in.tipos_persona_id
    emp_db.regimen_tributario_id = emp_in.regimen_tributario_id
    emp_db.moneda_principal_id = emp_in.moneda_principal_id
    emp_db.actividad_economica_id = emp_in.actividad_economica_id
    emp_db.forma_pago_id = emp_in.forma_pago_id
    emp_db.retencion_id = emp_in.retencion_id
    emp_db.departamento_id = emp_in.departamento_id
    emp_db.ciudad_id = emp_in.ciudad_id
    emp_db.direccion = emp_in.direccion
    emp_db.sucursal_id = emp_in.sucursal_id
    emp_db.cargo = emp_in.cargo
    emp_db.fecha_nacimiento = emp_in.fecha_nacimiento
    emp_db.fecha_ingreso = emp_in.fecha_ingreso
    emp_db.activo = emp_in.activo
    emp_db.es_vendedor = emp_in.es_vendedor
    emp_db.observacion = emp_in.observacion

    # 5) Guardar
    await db.commit()

    # 6) Realizar segunda consulta para recargar con relaciones
    stmt2 = (
        select(Empleado)
        .where(Empleado.id == empleado_id)
        .options(
            selectinload(Empleado.tipo_documento),
            selectinload(Empleado.departamento),
            selectinload(Empleado.ciudad),
        )
    )
    result2 = await db.execute(stmt2)
    emp_recargado = result2.scalars().first()

    if not emp_recargado:
        raise HTTPException(status_code=404, detail="Empleado no encontrado tras actualizar.")

    return emp_recargado

# ------------------------------------------------------------------------------
# PATCH: Actualizar empleado (parcial)
# ------------------------------------------------------------------------------
@router.patch("/{empleado_id}", response_model=EmpleadoResponseSchema)
async def actualizar_empleado_parcial(
    empleado_id: int,
    emp_patch: EmpleadoPatchSchema,
    db: AsyncSession = Depends(get_db),
):
    """
    Actualiza SOLO los campos que vengan en el JSON (partial update).
    """
    # 1) Cargamos inicialmente SOLO el objeto sin relaciones (o con pocas relaciones).
    stmt = select(Empleado).where(Empleado.id == empleado_id)
    result = await db.execute(stmt)
    emp_db = result.scalars().first()
    if not emp_db:
        raise HTTPException(status_code=404, detail="Empleado no encontrado")

    campos = emp_patch.dict(exclude_unset=True)

    # 2) Validar si cambia numero_documento
    if "numero_documento" in campos:
        numero_nuevo = normalize_text(campos["numero_documento"]).strip()
        if numero_nuevo != emp_db.numero_documento:
            org_id = campos.get("organizacion_id", emp_db.organizacion_id)
            stmt_dup = select(Empleado).where(
                Empleado.organizacion_id == org_id,
                Empleado.numero_documento == numero_nuevo,
                Empleado.id != emp_db.id
            )
            dup_result = await db.execute(stmt_dup)
            duplicado = dup_result.scalars().first()
            if duplicado:
                raise HTTPException(
                    status_code=400,
                    detail="Documento duplicado en la misma organización."
                )
            campos["numero_documento"] = numero_nuevo

    # 3) Si cambia nombre_razon_social => convertir a mayúsculas
    if "nombre_razon_social" in campos and campos["nombre_razon_social"]:
        campos["nombre_razon_social"] = campos["nombre_razon_social"].upper()

    # 4) Recalcular DV si cambia tipo_documento_id o numero_documento
    if ("tipo_documento_id" in campos) or ("numero_documento" in campos):
        tdoc = campos.get("tipo_documento_id", emp_db.tipo_documento_id)
        ndoc = campos.get("numero_documento", emp_db.numero_documento)
        dv_calc = calc_dv_if_nit(tdoc, ndoc)
        if dv_calc:
            emp_db.dv = dv_calc

    # 5) Asignar campos en el objeto
    for key, value in campos.items():
        setattr(emp_db, key, value)

    await db.commit()

    # 6) Hacemos UNA SEGUNDA CONSULTA para recargar con relaciones (evitando lazy-load)
    stmt2 = (
        select(Empleado)
        .where(Empleado.id == empleado_id)
        .options(
            selectinload(Empleado.tipo_documento),
            # Si tu EmpleadoResponseSchema también incluye otros:
            selectinload(Empleado.departamento),
            selectinload(Empleado.ciudad),
        )
    )
    result2 = await db.execute(stmt2)
    emp_recargado = result2.scalars().first()

    if not emp_recargado:
        # Muy poco probable, pero por seguridad
        raise HTTPException(status_code=404, detail="Empleado no encontrado tras actualizar.")

    # 7) Retornamos el objeto fresco con sus relaciones ya cargadas
    return emp_recargado

# ------------------------------------------------------------------------------
# DELETE: Eliminar Empleado
# ------------------------------------------------------------------------------
@router.delete("/{empleado_id}")
async def eliminar_empleado(
    empleado_id: int,
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Empleado).where(Empleado.id == empleado_id)
    result = await db.execute(stmt)
    emp_db = result.scalars().first()
    if not emp_db:
        raise HTTPException(status_code=404, detail="Empleado no encontrado")

    await db.delete(emp_db)
    await db.commit()

    return {"message": "Empleado eliminado correctamente"}
