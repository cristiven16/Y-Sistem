from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
from datetime import datetime

from database import get_db
from schemas.clientes import (
    ClienteSchema,
    ClienteResponseSchema,
    PaginatedClientes,
    ClienteUpdateSchema,
)
from models.clientes import Cliente
from dependencies.auth import get_current_user
from services.dv_calculator import calc_dv_if_nit

router = APIRouter(
    prefix="/clientes",
    tags=["Clientes"],
    dependencies=[Depends(get_current_user)]
)

def normalize_text(text: str) -> str:
    return (text.replace("á", "a")
               .replace("é", "e")
               .replace("í", "i")
               .replace("ó", "o")
               .replace("ú", "u"))

@router.post("/", response_model=dict)
async def crear_cliente(
    cliente: ClienteSchema,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """
    Crea un nuevo cliente.
    """
    # Normalizar
    cliente.nombre_razon_social = cliente.nombre_razon_social.upper()
    cliente.numero_documento = normalize_text(cliente.numero_documento).strip()

    # Verificar duplicado (misma organización)
    stmt_duplicado = select(Cliente).where(
        Cliente.organizacion_id == cliente.organizacion_id,
        Cliente.numero_documento == cliente.numero_documento
    )
    result = await db.execute(stmt_duplicado)
    existe = result.scalars().first()
    if existe:
        raise HTTPException(
            status_code=400,
            detail="El número de identificación ya existe para esta organización."
        )

    # Calcular dígito de verificación si es NIT
    dv_calculado = calc_dv_if_nit(cliente.tipo_documento_id, cliente.numero_documento)

    # Crear instancia
    nuevo_cliente = Cliente(
        tipo_documento_id=cliente.tipo_documento_id,
        organizacion_id=cliente.organizacion_id,
        dv=dv_calculado,
        numero_documento=cliente.numero_documento,
        nombre_razon_social=cliente.nombre_razon_social,
        email=cliente.email,
        pagina_web=cliente.pagina_web,
        departamento_id=cliente.departamento_id,
        ciudad_id=cliente.ciudad_id,
        direccion=cliente.direccion,
        telefono1=cliente.telefono1,
        telefono2=cliente.telefono2,
        celular=cliente.celular,
        whatsapp=cliente.whatsapp,
        tipos_persona_id=cliente.tipos_persona_id,
        regimen_tributario_id=cliente.regimen_tributario_id,
        moneda_principal_id=cliente.moneda_principal_id,
        tarifa_precios_id=cliente.tarifa_precios_id,
        actividad_economica_id=cliente.actividad_economica_id,
        forma_pago_id=cliente.forma_pago_id,
        retencion_id=cliente.retencion_id,
        permitir_venta=cliente.permitir_venta,
        descuento=cliente.descuento,
        cupo_credito=cliente.cupo_credito,
        tipo_marketing_id=cliente.tipo_marketing_id,
        sucursal_id=cliente.sucursal_id,
        ruta_logistica_id=cliente.ruta_logistica_id,
        vendedor_id=cliente.vendedor_id,
        observacion=cliente.observacion,
    )
    db.add(nuevo_cliente)
    await db.commit()
    await db.refresh(nuevo_cliente)

    return {
        "message": "Cliente creado con éxito",
        "id": nuevo_cliente.id,
        "numero_documento": nuevo_cliente.numero_documento,
    }

@router.get("/", response_model=PaginatedClientes)
async def obtener_clientes(
    db: AsyncSession = Depends(get_db),
    search: Optional[str] = Query(None),
    page: int = 1,
    page_size: int = 10
):
    """
    Paginar clientes con filtrado por 'search' (sobre nombre_razon_social).
    """
    # Si 'ClienteResponseSchema' accede a 'tipo_documento', debemos cargarlo aquí.
    base_stmt = (
        select(Cliente)
        .options(
            selectinload(Cliente.departamento),
            selectinload(Cliente.ciudad),
            selectinload(Cliente.tipo_documento),  # <-- Se incluye para evitar MissingGreenlet
            # Si tu modelo tiene relación con 'organizacion', 'regimen_tributario', etc.
            # y lo usas en el esquema, agrégalo también:
            # selectinload(Cliente.organizacion),
            # selectinload(Cliente.regimen_tributario),
        )
    )

    if search:
        normalized_search = normalize_text(search).strip().lower()
        terms = normalized_search.split()
        for term in terms:
            base_stmt = base_stmt.where(
                func.lower(Cliente.nombre_razon_social).ilike(f"%{term}%")
            )

    # Contar total de registros con la misma query base
    count_stmt = base_stmt.with_only_columns(func.count(Cliente.id))
    total_result = await db.execute(count_stmt)
    total_registros = total_result.scalar() or 0

    # Calcular total de páginas
    total_paginas = max((total_registros + page_size - 1) // page_size, 1)
    if page > total_paginas:
        page = total_paginas

    offset = (page - 1) * page_size
    stmt_paginado = base_stmt.offset(offset).limit(page_size)

    result_clientes = await db.execute(stmt_paginado)
    clientes_db = result_clientes.scalars().all()

    # Convertir a Pydantic (asegúrate de que el esquema tenga from_attributes = True o orm_mode)
    data = [ClienteResponseSchema.from_orm(c) for c in clientes_db]

    return {
        "data": data,
        "page": page,
        "total_paginas": total_paginas,
        "total_registros": total_registros,
    }

@router.get("/{cliente_id}", response_model=ClienteResponseSchema)
async def obtener_cliente(
    cliente_id: int,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """
    Obtiene un cliente por su ID.
    """
    # Cargar también las relaciones en la consulta detallada
    stmt = (
        select(Cliente)
        .where(Cliente.id == cliente_id)
        .options(
            selectinload(Cliente.departamento),
            selectinload(Cliente.ciudad),
            selectinload(Cliente.tipo_documento),  # <-- Igualmente aquí si la necesitas
        )
    )
    result = await db.execute(stmt)
    cliente_db = result.scalars().first()
    if not cliente_db:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")

    return cliente_db

@router.patch("/{cliente_id}", response_model=ClienteResponseSchema)
async def actualizar_parcial_cliente(
    cliente_id: int,
    cliente_data: ClienteUpdateSchema,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """
    Actualiza campos específicos del cliente (partial update).
    """
    # 1) Consulta inicial (sin relaciones o solo columnas)
    stmt = select(Cliente).where(Cliente.id == cliente_id)
    result = await db.execute(stmt)
    cliente_db = result.scalars().first()
    if not cliente_db:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")

    campos = cliente_data.dict(exclude_unset=True)

    # 2) Validación si se cambia el número de documento
    if "numero_documento" in campos:
        doc_nuevo = normalize_text(campos["numero_documento"]).strip()
        if doc_nuevo != cliente_db.numero_documento:
            org_id = campos.get("organizacion_id", cliente_db.organizacion_id)
            stmt_dup = select(Cliente).where(
                Cliente.organizacion_id == org_id,
                Cliente.numero_documento == doc_nuevo,
                Cliente.id != cliente_db.id
            )
            check_dup = await db.execute(stmt_dup)
            existe = check_dup.scalars().first()
            if existe:
                raise HTTPException(
                    status_code=400,
                    detail="Ya existe ese documento en la organización."
                )
            campos["numero_documento"] = doc_nuevo

    # 3) Calcular DV si cambia tipo_doc o numero_documento
    if "tipo_documento_id" in campos or "numero_documento" in campos:
        tdoc = campos.get("tipo_documento_id", cliente_db.tipo_documento_id)
        ndoc = campos.get("numero_documento", cliente_db.numero_documento)
        dv = calc_dv_if_nit(tdoc, ndoc)
        if dv:
            cliente_db.dv = dv

    # 4) Actualizar los campos en memoria
    for key, value in campos.items():
        if key == "nombre_razon_social" and value:
            value = normalize_text(value).upper()
        setattr(cliente_db, key, value)

    await db.commit()

    # 5) SEGUNDA CONSULTA (carga de relaciones con selectinload / joinedload)
    #    para devolver el objeto fresco con todos sus campos y relaciones.
    stmt2 = (
        select(Cliente)
        .where(Cliente.id == cliente_id)
        .options(
            # Asegúrate de cargar TODAS las relaciones que tu
            # esquema ClienteResponseSchema requiera, por ejemplo:
            selectinload(Cliente.departamento),
            selectinload(Cliente.ciudad),
            selectinload(Cliente.tipo_documento),
        )
    )
    result2 = await db.execute(stmt2)
    cliente_fresco = result2.scalars().first()

    if not cliente_fresco:
        # (En teoría no debería ocurrir, pero por seguridad)
        raise HTTPException(status_code=404, detail="Cliente no encontrado tras la actualización.")

    # 6) Retornar el cliente con todas las relaciones ya cargadas
    return cliente_fresco

@router.delete("/{cliente_id}")
async def eliminar_cliente(
    cliente_id: int,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """
    Elimina un cliente por su ID.
    """
    stmt = select(Cliente).where(Cliente.id == cliente_id)
    result = await db.execute(stmt)
    cliente_db = result.scalars().first()

    if not cliente_db:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")

    await db.delete(cliente_db)
    await db.commit()
    return {"message": "Cliente eliminado correctamente"}
