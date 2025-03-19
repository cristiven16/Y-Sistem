# gestion_negocio/routes/organizations.py

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from datetime import datetime, timedelta
from sqlalchemy import select, update, delete, or_, func
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import joinedload
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_db
from models.organizaciones import (
    Organizacion,
    Sucursal,
    Bodega,
    Caja,
    TiendaVirtual,
    CentroCosto,
    NumeracionTransaccion
)
from models.planes import Plan
from schemas.org_schemas import (
    OrganizacionCreate, OrganizacionRead,
    SucursalCreate, SucursalRead, SucursalNested,
    BodegaCreate, BodegaRead,
    CajaCreate, CajaRead, PaginatedCajas,
    TiendaVirtualCreate, TiendaVirtualRead, PaginatedTiendasVirtuales,
    CentroCostoCreate, CentroCostoRead, PaginatedCentrosCostos,
    PaginatedSucursales, SucursalUpdate, PaginatedBodegas,
    NumeracionTransaccionBase, NumeracionTransaccionCreate,
    NumeracionTransaccionRead, PaginatedNumeraciones
)
from dependencies.auth import (
    get_current_user,
    role_required_at_most,
    ROLE_SUPERADMIN,
    ROLE_ADMIN
)
from services.audit_service import log_event
from services.dv_calculator import calc_dv_if_nit  # si necesitas DV

router = APIRouter(
    prefix="/organizations",
    tags=["Organizations"],
    dependencies=[Depends(get_current_user)]
)

# -----------------------------------------------------------------------------
#                           ORGANIZACIONES
# -----------------------------------------------------------------------------

@router.post("/",
    response_model=OrganizacionRead,
    dependencies=[Depends(role_required_at_most(ROLE_ADMIN))]
)
async def create_organization(
    data: OrganizacionCreate,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """
    Crea una nueva Organización, asignando automáticamente un plan 'Lite' (ID=1)
    con 15 días de prueba. Acceso: rol_id <= 2 => Admin o Superadmin
    """
    # Calcular DV si corresponde
    dv_calculado = None
    if data.tipo_documento_id and data.numero_documento:
        dv_calculado = calc_dv_if_nit(data.tipo_documento_id, data.numero_documento)

    # Buscar plan Lite (ID=1)
    stmt_plan = select(Plan).where(Plan.id == 1)
    res_plan = await db.execute(stmt_plan)
    plan_lite = res_plan.scalars().first()
    if not plan_lite:
        raise HTTPException(
            status_code=400,
            detail="No existe el plan Lite (ID=1)."
        )

    fecha_inicio = datetime.utcnow()
    fecha_fin = fecha_inicio + timedelta(days=15)

    org = Organizacion(
        tipo_documento_id=data.tipo_documento_id,
        numero_documento=data.numero_documento,
        dv=dv_calculado,
        nombre_fiscal=data.nombre_fiscal,
        nombre_comercial=data.nombre_comercial,
        nombre_corto=data.nombre_corto,
        obligado_contabilidad=data.obligado_contabilidad,
        email_principal=data.email_principal,
        email_alertas_facturacion=data.email_alertas_facturacion,
        email_alertas_soporte=data.email_alertas_soporte,
        celular_whatsapp=data.celular_whatsapp,
        pagina_web=data.pagina_web,
        encabezado_personalizado=data.encabezado_personalizado,
        dias_dudoso_recaudo=data.dias_dudoso_recaudo,
        recibir_copia_email_documentos_electronicos=data.recibir_copia_email_documentos_electronicos,
        politica_garantias=data.politica_garantias,
        plan_id=plan_lite.id,
        fecha_inicio_plan=fecha_inicio,
        fecha_fin_plan=fecha_fin,
        trial_activo=True
    )
    db.add(org)
    await db.commit()
    await db.refresh(org)

    await log_event(db, current_user.id, "ORG_CREATED",
                    f"Organización {org.nombre_fiscal} creada con plan Lite")
    return org


@router.get("/{org_id}", response_model=OrganizacionRead)
async def get_organization(
    org_id: int,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """
    Obtiene la organización por ID (cualquier usuario logueado).
    """
    stmt_org = select(Organizacion).where(Organizacion.id == org_id)
    res_org = await db.execute(stmt_org)
    org = res_org.scalars().first()
    if not org:
        raise HTTPException(404, "Organización no encontrada")
    return org


@router.put("/{org_id}",
    response_model=OrganizacionRead,
    dependencies=[Depends(role_required_at_most(ROLE_ADMIN))])
async def update_organization(
    org_id: int,
    data: OrganizacionCreate,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """
    Actualiza una Organización existente. Acceso: rol_id <= 2 => Admin o Superadmin
    """
    stmt = select(Organizacion).where(Organizacion.id == org_id)
    res = await db.execute(stmt)
    org = res.scalars().first()
    if not org:
        raise HTTPException(404, "Organización no encontrada")

    fields = data.dict(exclude_unset=True)

    # Recalcular DV si cambian tipo_documento y número
    if "tipo_documento_id" in fields and "numero_documento" in fields:
        org.dv = calc_dv_if_nit(fields["tipo_documento_id"], fields["numero_documento"])

    # Asignar campos
    for key, value in fields.items():
        setattr(org, key, value)

    await db.commit()
    await db.refresh(org)

    await log_event(db, current_user.id, "ORG_UPDATED", f"Organización {org.id} actualizada")
    return org


@router.delete("/{org_id}",
    dependencies=[Depends(role_required_at_most(ROLE_SUPERADMIN))])
async def delete_organization(
    org_id: int,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """
    Elimina la Organización por ID. Solo superadmin (rol_id <= 1).
    """
    stmt = select(Organizacion).where(Organizacion.id == org_id)
    res = await db.execute(stmt)
    org = res.scalars().first()
    if not org:
        raise HTTPException(404, "Organización no encontrada")

    await db.delete(org)
    await db.commit()

    await log_event(db, current_user.id, "ORG_DELETED", f"Organización {org_id} eliminada")
    return {"message": f"Organización {org_id} eliminada con éxito"}


@router.put("/{org_id}/set_plan/{plan_id}",
    dependencies=[Depends(role_required_at_most(ROLE_SUPERADMIN))])
async def set_organization_plan(
    org_id: int,
    plan_id: int,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """
    Asigna el plan con ID=plan_id a la organización org_id. Solo superadmin.
    """
    stmt_org = select(Organizacion).where(Organizacion.id == org_id)
    res_org = await db.execute(stmt_org)
    org = res_org.scalars().first()
    if not org:
        raise HTTPException(404, "Organización no encontrada")

    stmt_plan = select(Plan).where(Plan.id == plan_id)
    res_plan = await db.execute(stmt_plan)
    plan = res_plan.scalars().first()
    if not plan:
        raise HTTPException(404, "Plan no encontrado")

    org.plan_id = plan_id
    # Aquí podrías cambiar fechas trial etc.

    await db.commit()
    await db.refresh(org)

    await log_event(db, current_user.id, "ORG_PLAN_UPDATED",
                    f"Plan {plan.nombre_plan} asignado a org {org_id}")

    return {
        "message": f"Plan {plan.nombre_plan} asignado a la organización {org_id}",
        "plan": plan.nombre_plan
    }

# -----------------------------------------------------------------------------
#                               SUCURSALES
# -----------------------------------------------------------------------------
@router.get("/{org_id}/sucursales", response_model=PaginatedSucursales)
async def list_sucursales(
    org_id: int,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
    search: Optional[str] = None,
    page: int = 1,
    page_size: int = 10
):
    # Verificar org
    stmt_org = select(Organizacion).where(Organizacion.id == org_id)
    res_org = await db.execute(stmt_org)
    org = res_org.scalars().first()
    if not org:
        raise HTTPException(404, "Organización no encontrada")

    # Query base
    stmt_base = (
        select(Sucursal)
        .where(Sucursal.organizacion_id == org_id)
        .options(joinedload(Sucursal.departamento), joinedload(Sucursal.ciudad))
    )
    if search:
        stmt_base = stmt_base.where(Sucursal.nombre.ilike(f"%{search}%"))

    # Contar
    count_stmt = stmt_base.with_only_columns(func.count(Sucursal.id))
    res_count = await db.execute(count_stmt)
    total_registros = res_count.scalar() or 0

    total_paginas = max((total_registros + page_size - 1)//page_size, 1)
    if page > total_paginas:
        page = total_paginas
    offset = (page - 1)*page_size

    # Paginado
    stmt_paginado = stmt_base.offset(offset).limit(page_size)
    res_suc = await db.execute(stmt_paginado)
    sucursales_db = res_suc.scalars().all()

    data = [SucursalRead.from_orm(s) for s in sucursales_db]
    return {
        "data": data,
        "page": page,
        "total_paginas": total_paginas,
        "total_registros": total_registros
    }


@router.post("/{org_id}/sucursales",
    response_model=SucursalRead,
    dependencies=[Depends(role_required_at_most(ROLE_ADMIN))])
async def create_sucursal(
    org_id: int,
    data: SucursalCreate,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """
    Crea una nueva Sucursal en la org {org_id}.
    """
    stmt_org = select(Organizacion).where(Organizacion.id == org_id)
    res_org = await db.execute(stmt_org)
    org = res_org.scalars().first()
    if not org:
        raise HTTPException(404, "Organización no encontrada")

    if data.organizacion_id != org_id:
        raise HTTPException(400, "El organizacion_id no coincide con la URL")

    # Validar si es sucursal principal
    if data.sucursal_principal:
        stmt_princ = select(Sucursal).where(
            Sucursal.organizacion_id == org_id,
            Sucursal.sucursal_principal == True
        )
        res_princ = await db.execute(stmt_princ)
        existing_princ = res_princ.scalars().first()
        if existing_princ:
            raise HTTPException(
                status_code=400,
                detail="Ya existe una sucursal principal en esta organización."
            )

    nueva_sucursal = Sucursal(
        organizacion_id=org_id,
        nombre=data.nombre,
        pais=data.pais,
        departamento_id=data.departamento_id,
        ciudad_id=data.ciudad_id,
        direccion=data.direccion,
        telefonos=data.telefonos,
        prefijo_transacciones=data.prefijo_transacciones,
        sucursal_principal=data.sucursal_principal,
        activa=data.activa
    )
    db.add(nueva_sucursal)
    await db.commit()
    await db.refresh(nueva_sucursal)

    await log_event(db, current_user.id, "SUCURSAL_CREATED",
                    f"Sucursal {nueva_sucursal.nombre} creada en Org {org_id}")
    return nueva_sucursal


@router.get("/{org_id}/sucursales/{sucursal_id}", response_model=SucursalRead)
async def get_sucursal(
    org_id: int,
    sucursal_id: int,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """
    Retorna la sucursal {sucursal_id} de la org {org_id}.
    """
    stmt = select(Sucursal).where(
        Sucursal.id == sucursal_id,
        Sucursal.organizacion_id == org_id
    )
    res_suc = await db.execute(stmt)
    suc = res_suc.scalars().first()
    if not suc:
        raise HTTPException(404, "Sucursal no encontrada o no pertenece a la org.")
    return suc


@router.patch("/{org_id}/sucursales/{sucursal_id}",
    response_model=SucursalRead,
    dependencies=[Depends(role_required_at_most(ROLE_ADMIN))])
async def patch_sucursal(
    org_id: int,
    sucursal_id: int,
    data: SucursalUpdate,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """
    Actualiza parcialmente la sucursal {sucursal_id} de la org {org_id}.
    """
    stmt = select(Sucursal).where(
        Sucursal.id == sucursal_id,
        Sucursal.organizacion_id == org_id
    )
    res_suc = await db.execute(stmt)
    suc = res_suc.scalars().first()
    if not suc:
        raise HTTPException(404, "Sucursal no encontrada o no pertenece a la org.")

    campos = data.dict(exclude_unset=True)

    if "organizacion_id" in campos and campos["organizacion_id"] != org_id:
        raise HTTPException(400, "El organizacion_id no coincide con la URL")

    # Si pasa a principal => validar que no exista otra
    if "sucursal_principal" in campos and campos["sucursal_principal"] is True:
        stmt_princ = select(Sucursal).where(
            Sucursal.organizacion_id == org_id,
            Sucursal.sucursal_principal == True,
            Sucursal.id != suc.id
        )
        res_princ = await db.execute(stmt_princ)
        existing_princ = res_princ.scalars().first()
        if existing_princ:
            raise HTTPException(
                400,
                "Ya existe otra sucursal principal en esta org."
            )

    # Asignar
    for key, value in campos.items():
        setattr(suc, key, value)

    await db.commit()
    await db.refresh(suc)

    await log_event(db, current_user.id, "SUCURSAL_UPDATED",
                    f"Sucursal {suc.id} actualizada (PATCH)")
    return suc


@router.delete("/{org_id}/sucursales/{sucursal_id}",
    dependencies=[Depends(role_required_at_most(ROLE_ADMIN))])
async def delete_sucursal(
    org_id: int,
    sucursal_id: int,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """
    Elimina la sucursal {sucursal_id} de la org {org_id}.
    Retorna 400 si IntegrityError (registros asociados).
    """
    stmt = select(Sucursal).where(
        Sucursal.id == sucursal_id,
        Sucursal.organizacion_id == org_id
    )
    res_suc = await db.execute(stmt)
    suc = res_suc.scalars().first()
    if not suc:
        raise HTTPException(404, "Sucursal no encontrada o no pertenece a la org.")

    try:
        await db.delete(suc)
        await db.commit()
    except IntegrityError:
        await db.rollback()
        raise HTTPException(
            400,
            "No se puede eliminar la sucursal porque tiene registros asociados."
        )

    await log_event(db, current_user.id, "SUCURSAL_DELETED",
                    f"Sucursal {sucursal_id} eliminada de Org {org_id}")

    return {"message": f"Sucursal {sucursal_id} eliminada con éxito."}

# -----------------------------------------------------------------------------
#                         CENTROS DE COSTO
# -----------------------------------------------------------------------------
@router.get("/{org_id}/centros_costos", response_model=PaginatedCentrosCostos)
async def list_centros_costos(
    org_id: int,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
    search: Optional[str] = None,
    page: int = 1,
    page_size: int = 10
):
    stmt_org = select(Organizacion).where(Organizacion.id == org_id)
    res_org = await db.execute(stmt_org)
    org = res_org.scalars().first()
    if not org:
        raise HTTPException(404, "Organización no encontrada")

    stmt_base = select(CentroCosto).where(CentroCosto.organizacion_id == org_id)
    if search:
        stmt_base = stmt_base.where(
            or_(
                CentroCosto.nombre.ilike(f"%{search}%"),
                CentroCosto.codigo.ilike(f"%{search}%")
            )
        )

    count_stmt = stmt_base.with_only_columns(func.count(CentroCosto.id))
    res_count = await db.execute(count_stmt)
    total_registros = res_count.scalar() or 0
    total_paginas = max((total_registros + page_size - 1)//page_size, 1)
    if page > total_paginas:
        page = total_paginas
    offset = (page - 1)*page_size

    stmt_pag = stmt_base.offset(offset).limit(page_size)
    res_cc = await db.execute(stmt_pag)
    centros_db = res_cc.scalars().all()

    data = [CentroCostoRead.from_orm(cc) for cc in centros_db]
    return {
        "data": data,
        "page": page,
        "total_paginas": total_paginas,
        "total_registros": total_registros
    }

@router.post("/{org_id}/centros_costos",
    response_model=CentroCostoRead,
    dependencies=[Depends(role_required_at_most(ROLE_ADMIN))])
async def create_centro_costo(
    org_id: int,
    data: CentroCostoCreate,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user)
):
    stmt_org = select(Organizacion).where(Organizacion.id == org_id)
    res_org = await db.execute(stmt_org)
    org = res_org.scalars().first()
    if not org:
        raise HTTPException(404, "Organización no encontrada")

    if data.organizacion_id != org_id:
        raise HTTPException(400, "El organizacion_id no coincide con la URL")

    nuevo_centro = CentroCosto(
        organizacion_id=org_id,
        codigo=data.codigo,
        nombre=data.nombre,
        nivel=data.nivel,
        padre_id=data.padre_id,
        permite_ingresos=data.permite_ingresos,
        estado=data.estado
    )
    db.add(nuevo_centro)
    await db.commit()
    await db.refresh(nuevo_centro)

    await log_event(db, current_user.id, "CC_CREATED",
                    f"Centro de costo {nuevo_centro.codigo} creado en Org {org_id}")
    return nuevo_centro


@router.get("/{org_id}/centros_costos/{centro_id}", response_model=CentroCostoRead)
async def get_centro_costo(
    org_id: int,
    centro_id: int,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user)
):
    stmt = select(CentroCosto).where(
        CentroCosto.id == centro_id,
        CentroCosto.organizacion_id == org_id
    )
    res_cc = await db.execute(stmt)
    cc = res_cc.scalars().first()
    if not cc:
        raise HTTPException(404, "Centro de costo no encontrado o no pertenece a la org.")
    return cc


@router.put("/{org_id}/centros_costos/{centro_id}",
    response_model=CentroCostoRead,
    dependencies=[Depends(role_required_at_most(ROLE_ADMIN))])
async def update_centro_costo(
    org_id: int,
    centro_id: int,
    data: CentroCostoCreate,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user)
):
    stmt = select(CentroCosto).where(
        CentroCosto.id == centro_id,
        CentroCosto.organizacion_id == org_id
    )
    res_cc = await db.execute(stmt)
    cc = res_cc.scalars().first()
    if not cc:
        raise HTTPException(404, "Centro de costo no encontrado.")

    fields = data.dict(exclude_unset=True)
    if "organizacion_id" in fields and fields["organizacion_id"] != org_id:
        raise HTTPException(400, "El organizacion_id no coincide con la URL")

    for key, value in fields.items():
        setattr(cc, key, value)

    await db.commit()
    await db.refresh(cc)
    await log_event(db, current_user.id, "CC_UPDATED",
                    f"Centro de costo {cc.id} actualizado")
    return cc


@router.delete("/{org_id}/centros_costos/{centro_id}",
    dependencies=[Depends(role_required_at_most(ROLE_ADMIN))])
async def delete_centro_costo(
    org_id: int,
    centro_id: int,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user)
):
    stmt = select(CentroCosto).where(
        CentroCosto.id == centro_id,
        CentroCosto.organizacion_id == org_id
    )
    res_cc = await db.execute(stmt)
    cc = res_cc.scalars().first()
    if not cc:
        raise HTTPException(404, "Centro de costo no encontrado.")

    await db.delete(cc)
    await db.commit()
    await log_event(db, current_user.id, "CC_DELETED",
                    f"Centro de costo {centro_id} eliminado de Org {org_id}")
    return {"message": f"Centro de costo {centro_id} eliminado con éxito."}

# -----------------------------------------------------------------------------
#                                 BODEGAS
# -----------------------------------------------------------------------------
@router.post("/{org_id}/bodegas",
    response_model=BodegaRead,
    dependencies=[Depends(role_required_at_most(ROLE_ADMIN))])
async def create_bodega(
    org_id: int,
    data: BodegaCreate,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user)
):
    stmt_org = select(Organizacion).where(Organizacion.id == org_id)
    res_org = await db.execute(stmt_org)
    org = res_org.scalars().first()
    if not org:
        raise HTTPException(404, "Organización no encontrada")

    if data.organizacion_id != org_id:
        raise HTTPException(400, "El organizacion_id no coincide con la URL")

    nueva_bodega = Bodega(
        organizacion_id=org_id,
        sucursal_id=data.sucursal_id,
        nombre=data.nombre,
        bodega_por_defecto=data.bodega_por_defecto,
        estado=data.estado
    )
    db.add(nueva_bodega)
    await db.commit()
    await db.refresh(nueva_bodega)

    await log_event(db, current_user.id, "BODEGA_CREATED",
                    f"Bodega {nueva_bodega.nombre} creada en Org {org_id}")
    return nueva_bodega


@router.get("/{org_id}/bodegas/{bodega_id}", response_model=BodegaRead)
async def get_bodega(
    org_id: int,
    bodega_id: int,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user)
):
    stmt = select(Bodega).where(
        Bodega.id == bodega_id,
        Bodega.organizacion_id == org_id
    )
    res_bod = await db.execute(stmt)
    bod = res_bod.scalars().first()
    if not bod:
        raise HTTPException(404, "Bodega no encontrada.")
    return bod


@router.get("/{org_id}/bodegas", response_model=PaginatedBodegas)
async def list_bodegas(
    org_id: int,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
    search: Optional[str] = None,
    page: int = 1,
    page_size: int = 10
):
    stmt_org = select(Organizacion).where(Organizacion.id == org_id)
    res_org = await db.execute(stmt_org)
    org = res_org.scalars().first()
    if not org:
        raise HTTPException(404, "Organización no encontrada")

    stmt_base = (
        select(Bodega)
        .where(Bodega.organizacion_id == org_id)
        .options(joinedload(Bodega.sucursal))
    )
    if search:
        stmt_base = stmt_base.where(Bodega.nombre.ilike(f"%{search}%"))

    # conteo
    count_stmt = stmt_base.with_only_columns(func.count(Bodega.id))
    res_count = await db.execute(count_stmt)
    total_registros = res_count.scalar() or 0
    total_paginas = max((total_registros + page_size - 1)//page_size, 1)
    if page > total_paginas:
        page = total_paginas

    offset = (page - 1)*page_size
    stmt_pag = stmt_base.offset(offset).limit(page_size)
    res_bod = await db.execute(stmt_pag)
    bodegas_db = res_bod.scalars().all()

    data = [BodegaRead.from_orm(b) for b in bodegas_db]
    return {
        "data": data,
        "page": page,
        "total_paginas": total_paginas,
        "total_registros": total_registros
    }


@router.put("/{org_id}/bodegas/{bodega_id}",
    response_model=BodegaRead,
    dependencies=[Depends(role_required_at_most(ROLE_ADMIN))])
async def update_bodega(
    org_id: int,
    bodega_id: int,
    data: BodegaCreate,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user)
):
    stmt = select(Bodega).where(
        Bodega.id == bodega_id,
        Bodega.organizacion_id == org_id
    )
    res_bod = await db.execute(stmt)
    bod = res_bod.scalars().first()
    if not bod:
        raise HTTPException(404, "Bodega no encontrada.")

    fields = data.dict(exclude_unset=True)
    if "organizacion_id" in fields and fields["organizacion_id"] != org_id:
        raise HTTPException(400, "El organizacion_id no coincide con la URL")

    # Si bodega_por_defecto = True => desactivar en las demás
    if fields.get("bodega_por_defecto") is True:
        stmt_update_others = (
            update(Bodega)
            .where(Bodega.organizacion_id == org_id, Bodega.id != bodega_id)
            .values(bodega_por_defecto=False)
        )
        await db.execute(stmt_update_others)
        await db.commit()

    for key, value in fields.items():
        setattr(bod, key, value)

    await db.commit()
    await db.refresh(bod)

    await log_event(db, current_user.id, "BODEGA_UPDATED",
                    f"Bodega {bod.id} actualizada")
    return bod


@router.delete("/{org_id}/bodegas/{bodega_id}",
    dependencies=[Depends(role_required_at_most(ROLE_ADMIN))])
async def delete_bodega(
    org_id: int,
    bodega_id: int,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user)
):
    stmt = select(Bodega).where(
        Bodega.id == bodega_id,
        Bodega.organizacion_id == org_id
    )
    res_bod = await db.execute(stmt)
    bod = res_bod.scalars().first()
    if not bod:
        raise HTTPException(404, "Bodega no encontrada...")

    await db.delete(bod)
    await db.commit()
    await log_event(db, current_user.id, "BODEGA_DELETED",
                    f"Bodega {bodega_id} eliminada de Org {org_id}")
    return {"message": f"Bodega {bodega_id} eliminada con éxito."}


# -----------------------------------------------------------------------------
#                                 CAJAS
# -----------------------------------------------------------------------------
@router.post("/{org_id}/cajas",
    response_model=CajaRead,
    dependencies=[Depends(role_required_at_most(ROLE_ADMIN))])
async def create_caja(
    org_id: int,
    data: CajaCreate,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user)
):
    stmt_org = select(Organizacion).where(Organizacion.id == org_id)
    res_org = await db.execute(stmt_org)
    org = res_org.scalars().first()
    if not org:
        raise HTTPException(404, "Organización no encontrada")

    if data.organizacion_id != org_id:
        raise HTTPException(400, "El organizacion_id no coincide con la URL")

    nueva_caja = Caja(
        organizacion_id=org_id,
        nombre=data.nombre,
        sucursal_id=data.sucursal_id,
        estado=data.estado,
        vigencia=data.vigencia
    )
    db.add(nueva_caja)
    await db.commit()
    await db.refresh(nueva_caja)

    await log_event(db, current_user.id, "CAJA_CREATED",
                    f"Caja {nueva_caja.nombre} creada en Org {org_id}")
    return nueva_caja


@router.get("/{org_id}/cajas", response_model=PaginatedCajas)
async def list_cajas(
    org_id: int,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
    search: Optional[str] = None,
    page: int = 1,
    page_size: int = 10
):
    stmt_org = select(Organizacion).where(Organizacion.id == org_id)
    res_org = await db.execute(stmt_org)
    org = res_org.scalars().first()
    if not org:
        raise HTTPException(404, "Organización no encontrada")

    stmt_base = (
        select(Caja)
        .where(Caja.organizacion_id == org_id)
        .options(joinedload(Caja.sucursal))
    )
    if search:
        stmt_base = stmt_base.where(Caja.nombre.ilike(f"%{search}%"))

    count_stmt = stmt_base.with_only_columns(func.count(Caja.id))
    res_count = await db.execute(count_stmt)
    total_registros = res_count.scalar() or 0
    total_paginas = max((total_registros + page_size - 1)//page_size, 1)
    if page > total_paginas:
        page = total_paginas
    offset = (page - 1)*page_size

    stmt_pag = stmt_base.offset(offset).limit(page_size)
    res_cajas = await db.execute(stmt_pag)
    cajas_db = res_cajas.scalars().all()

    data = [CajaRead.from_orm(caja) for caja in cajas_db]
    return {
        "data": data,
        "page": page,
        "total_paginas": total_paginas,
        "total_registros": total_registros
    }

@router.put("/{org_id}/cajas/{caja_id}",
    response_model=CajaRead,
    dependencies=[Depends(role_required_at_most(ROLE_ADMIN))])
async def update_caja(
    org_id: int,
    caja_id: int,
    data: CajaCreate,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user)
):
    stmt = select(Caja).where(
        Caja.id == caja_id,
        Caja.organizacion_id == org_id
    )
    res_caja = await db.execute(stmt)
    caja = res_caja.scalars().first()
    if not caja:
        raise HTTPException(404, "Caja no encontrada o no pertenece a la organización.")

    fields = data.dict(exclude_unset=True)
    if "organizacion_id" in fields and fields["organizacion_id"] != org_id:
        raise HTTPException(400, "El organizacion_id no coincide con la URL")

    for key, value in fields.items():
        setattr(caja, key, value)

    await db.commit()
    await db.refresh(caja)
    await log_event(db, current_user.id, "CAJA_UPDATED", f"Caja {caja.id} actualizada")
    return caja


@router.delete("/{org_id}/cajas/{caja_id}",
    dependencies=[Depends(role_required_at_most(ROLE_ADMIN))])
async def delete_caja(
    org_id: int,
    caja_id: int,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user)
):
    stmt = select(Caja).where(
        Caja.id == caja_id,
        Caja.organizacion_id == org_id
    )
    res_caja = await db.execute(stmt)
    caja = res_caja.scalars().first()
    if not caja:
        raise HTTPException(404, "Caja no encontrada o no pertenece a la organización.")

    await db.delete(caja)
    await db.commit()
    await log_event(db, current_user.id, "CAJA_DELETED",
                    f"Caja {caja_id} eliminada de Org {org_id}")
    return {"message": f"Caja {caja_id} eliminada con éxito."}

# -----------------------------------------------------------------------------
#                          TIENDAS VIRTUALES
# -----------------------------------------------------------------------------
@router.post("/{org_id}/tiendas_virtuales",
    response_model=TiendaVirtualRead,
    dependencies=[Depends(role_required_at_most(ROLE_ADMIN))])
async def create_tienda_virtual(
    org_id: int,
    data: TiendaVirtualCreate,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user)
):
    stmt_org = select(Organizacion).where(Organizacion.id == org_id)
    res_org = await db.execute(stmt_org)
    org = res_org.scalars().first()
    if not org:
        raise HTTPException(404, "Organización no encontrada")

    if data.organizacion_id != org_id:
        raise HTTPException(400, "El organizacion_id no coincide con la URL")

    nueva_tienda = TiendaVirtual(
        organizacion_id=org_id,
        plataforma=data.plataforma,
        nombre=data.nombre,
        url=data.url,
        centro_costo_id=data.centro_costo_id,
        estado=data.estado
    )
    db.add(nueva_tienda)
    await db.commit()
    await db.refresh(nueva_tienda)

    await log_event(db, current_user.id, "TIENDA_CREATED",
                    f"Tienda Virtual {nueva_tienda.nombre} en Org {org_id}")
    return nueva_tienda


@router.get("/{org_id}/tiendas_virtuales", response_model=PaginatedTiendasVirtuales)
async def list_tiendas_virtuales(
    org_id: int,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
    search: Optional[str] = None,
    page: int = 1,
    page_size: int = 10
):
    stmt_org = select(Organizacion).where(Organizacion.id == org_id)
    res_org = await db.execute(stmt_org)
    org = res_org.scalars().first()
    if not org:
        raise HTTPException(404, "Organización no encontrada")

    stmt_base = select(TiendaVirtual).where(TiendaVirtual.organizacion_id == org_id)
    if search:
        search_like = f"%{search}%"
        stmt_base = stmt_base.where(or_(
            TiendaVirtual.nombre.ilike(search_like),
            TiendaVirtual.plataforma.ilike(search_like),
            TiendaVirtual.url.ilike(search_like),
        ))

    count_stmt = stmt_base.with_only_columns(func.count(TiendaVirtual.id))
    res_count = await db.execute(count_stmt)
    total_registros = res_count.scalar() or 0
    total_paginas = max((total_registros + page_size - 1)//page_size, 1)
    if page > total_paginas:
        page = total_paginas
    offset = (page - 1)*page_size

    stmt_pag = stmt_base.offset(offset).limit(page_size)
    res_tv = await db.execute(stmt_pag)
    tv_db = res_tv.scalars().all()

    data = [TiendaVirtualRead.from_orm(t) for t in tv_db]
    return {
        "data": data,
        "page": page,
        "total_paginas": total_paginas,
        "total_registros": total_registros
    }


@router.get("/{org_id}/tiendas_virtuales/{tienda_id}", response_model=TiendaVirtualRead)
async def get_tienda_virtual(
    org_id: int,
    tienda_id: int,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user)
):
    stmt = select(TiendaVirtual).where(
        TiendaVirtual.id == tienda_id,
        TiendaVirtual.organizacion_id == org_id
    )
    res_tv = await db.execute(stmt)
    tv = res_tv.scalars().first()
    if not tv:
        raise HTTPException(404, "Tienda Virtual no encontrada o no pertenece a la org.")
    return tv


@router.put("/{org_id}/tiendas_virtuales/{tienda_id}",
    response_model=TiendaVirtualRead,
    dependencies=[Depends(role_required_at_most(ROLE_ADMIN))])
async def update_tienda_virtual(
    org_id: int,
    tienda_id: int,
    data: TiendaVirtualCreate,  # o un TiendaVirtualUpdate
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user)
):
    stmt = select(TiendaVirtual).where(
        TiendaVirtual.id == tienda_id,
        TiendaVirtual.organizacion_id == org_id
    )
    res_tv = await db.execute(stmt)
    tv = res_tv.scalars().first()
    if not tv:
        raise HTTPException(404, "Tienda Virtual no encontrada.")

    fields = data.dict(exclude_unset=True)
    if "organizacion_id" in fields and fields["organizacion_id"] != org_id:
        raise HTTPException(400, "El organizacion_id no coincide con la URL")

    for key, value in fields.items():
        setattr(tv, key, value)

    await db.commit()
    await db.refresh(tv)
    await log_event(db, current_user.id, "TIENDA_UPDATED",
                    f"Tienda Virtual {tv.id} actualizada")
    return tv


@router.delete("/{org_id}/tiendas_virtuales/{tienda_id}",
    dependencies=[Depends(role_required_at_most(ROLE_ADMIN))])
async def delete_tienda_virtual(
    org_id: int,
    tienda_id: int,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user)
):
    stmt = select(TiendaVirtual).where(
        TiendaVirtual.id == tienda_id,
        TiendaVirtual.organizacion_id == org_id
    )
    res_tv = await db.execute(stmt)
    tv = res_tv.scalars().first()
    if not tv:
        raise HTTPException(404, "Tienda Virtual no encontrada.")

    await db.delete(tv)
    await db.commit()
    await log_event(db, current_user.id, "TIENDA_DELETED",
                    f"Tienda Virtual {tienda_id} eliminada de Org {org_id}")
    return {"message": f"Tienda Virtual {tienda_id} eliminada con éxito."}


# -----------------------------------------------------------------------------
#                  NUMERACIONES DE TRANSACCION
# -----------------------------------------------------------------------------
@router.post("/{org_id}/numeraciones",
    response_model=NumeracionTransaccionRead,
    dependencies=[Depends(role_required_at_most(ROLE_ADMIN))])
async def create_numeracion_transaccion(
    org_id: int,
    data: NumeracionTransaccionCreate,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user)
):
    stmt_org = select(Organizacion).where(Organizacion.id == org_id)
    res_org = await db.execute(stmt_org)
    org = res_org.scalars().first()
    if not org:
        raise HTTPException(404, "Organización no encontrada")

    if data.organizacion_id != org_id:
        raise HTTPException(400, "El organizacion_id no coincide con la URL")

    # Si es numeracion_por_defecto => desactivar en las demás
    if data.numeracion_por_defecto:
        stmt_update_others = (
            update(NumeracionTransaccion)
            .where(NumeracionTransaccion.organizacion_id == org_id)
            .values(numeracion_por_defecto=False)
        )
        await db.execute(stmt_update_others)
        await db.commit()

    nueva_num = NumeracionTransaccion(
        organizacion_id=org_id,
        tipo_transaccion=data.tipo_transaccion,
        nombre_personalizado=data.nombre_personalizado,
        titulo_transaccion=data.titulo_transaccion,
        mostrar_info_numeracion=data.mostrar_info_numeracion,
        separador_prefijo=data.separador_prefijo or "",
        titulo_numeracion=data.titulo_numeracion,
        longitud_numeracion=data.longitud_numeracion,
        numeracion_por_defecto=data.numeracion_por_defecto,
        numero_resolucion=data.numero_resolucion,
        fecha_expedicion=data.fecha_expedicion,
        fecha_vencimiento=data.fecha_vencimiento,
        prefijo=data.prefijo,
        numeracion_inicial=data.numeracion_inicial,
        numeracion_final=data.numeracion_final,
        numeracion_siguiente=data.numeracion_siguiente,
        total_maximo_por_transaccion=data.total_maximo_por_transaccion,
        transaccion_electronica=data.transaccion_electronica
    )
    db.add(nueva_num)
    await db.commit()
    await db.refresh(nueva_num)
    return nueva_num


@router.get("/{org_id}/numeraciones", response_model=PaginatedNumeraciones)
async def list_numeraciones_transaccion(
    org_id: int,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
    search: Optional[str] = None,
    page: int = 1,
    page_size: int = 10
):
    stmt_org = select(Organizacion).where(Organizacion.id == org_id)
    res_org = await db.execute(stmt_org)
    org = res_org.scalars().first()
    if not org:
        raise HTTPException(404, "Organización no encontrada")

    stmt_base = select(NumeracionTransaccion).where(NumeracionTransaccion.organizacion_id == org_id)
    if search:
        like_search = f"%{search}%"
        stmt_base = stmt_base.where(or_(
            NumeracionTransaccion.nombre_personalizado.ilike(like_search),
            NumeracionTransaccion.titulo_transaccion.ilike(like_search)
        ))

    count_stmt = stmt_base.with_only_columns(func.count(NumeracionTransaccion.id))
    res_count = await db.execute(count_stmt)
    total_registros = res_count.scalar() or 0
    total_paginas = max((total_registros + page_size - 1)//page_size, 1)
    if page > total_paginas:
        page = total_paginas
    offset = (page - 1)*page_size

    stmt_pag = stmt_base.offset(offset).limit(page_size)
    res_nums = await db.execute(stmt_pag)
    nums_db = res_nums.scalars().all()

    data = [NumeracionTransaccionRead.from_orm(n) for n in nums_db]
    return {
        "data": data,
        "page": page,
        "total_paginas": total_paginas,
        "total_registros": total_registros
    }


@router.get("/{org_id}/numeraciones/{num_id}", response_model=NumeracionTransaccionRead)
async def get_numeracion_transaccion(
    org_id: int,
    num_id: int,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user)
):
    stmt = select(NumeracionTransaccion).where(
        NumeracionTransaccion.id == num_id,
        NumeracionTransaccion.organizacion_id == org_id
    )
    res_num = await db.execute(stmt)
    num = res_num.scalars().first()
    if not num:
        raise HTTPException(404, "Numeración no encontrada.")
    return num


@router.put("/{org_id}/numeraciones/{num_id}",
    response_model=NumeracionTransaccionRead,
    dependencies=[Depends(role_required_at_most(ROLE_ADMIN))])
async def update_numeracion_transaccion(
    org_id: int,
    num_id: int,
    data: NumeracionTransaccionCreate,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user)
):
    stmt = select(NumeracionTransaccion).where(
        NumeracionTransaccion.id == num_id,
        NumeracionTransaccion.organizacion_id == org_id
    )
    res_num = await db.execute(stmt)
    num = res_num.scalars().first()
    if not num:
        raise HTTPException(404, "Numeración no encontrada.")

    fields = data.dict(exclude_unset=True)
    if "organizacion_id" in fields and fields["organizacion_id"] != org_id:
        raise HTTPException(400, "El organizacion_id no coincide con la URL")

    # Si numeracion_por_defecto => desactivar en las demás
    if fields.get("numeracion_por_defecto") is True:
        stmt_update_others = (
            update(NumeracionTransaccion)
            .where(
                NumeracionTransaccion.organizacion_id == org_id,
                NumeracionTransaccion.id != num_id
            )
            .values(numeracion_por_defecto=False)
        )
        await db.execute(stmt_update_others)
        await db.commit()

    for key, value in fields.items():
        setattr(num, key, value)

    await db.commit()
    await db.refresh(num)
    return num


@router.delete("/{org_id}/numeraciones/{num_id}",
    dependencies=[Depends(role_required_at_most(ROLE_ADMIN))])
async def delete_numeracion_transaccion(
    org_id: int,
    num_id: int,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user)
):
    stmt = select(NumeracionTransaccion).where(
        NumeracionTransaccion.id == num_id,
        NumeracionTransaccion.organizacion_id == org_id
    )
    res_num = await db.execute(stmt)
    num = res_num.scalars().first()
    if not num:
        raise HTTPException(404, "Numeración no encontrada.")

    await db.delete(num)
    await db.commit()
    return {"message": f"Numeración {num_id} eliminada con éxito."}
