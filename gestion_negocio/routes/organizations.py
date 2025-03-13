# gestion_negocio/routes/organizations.py

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from sqlalchemy.orm import joinedload
from sqlalchemy.exc import IntegrityError

from database import get_db
from models.organizaciones import (
    Organizacion,
    Sucursal,
    Bodega,
    Caja,
    TiendaVirtual,
    CentroCosto, NumeracionTransaccion
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
    NumeracionTransaccionBase, NumeracionTransaccionCreate, NumeracionTransaccionRead,PaginatedNumeraciones
)
from dependencies.auth import (
    get_current_user,
    role_required_at_most,
    ROLE_SUPERADMIN,
    ROLE_ADMIN
)
from services.audit_service import log_event
from services.dv_calculator import calc_dv_if_nit  # si calculas DV

router = APIRouter(
    prefix="/organizations",
    tags=["Organizations"],
    dependencies=[Depends(get_current_user)]
)

#
# =============================================================================
#                            ORGANIZACIONES (Ya existentes)
# =============================================================================
#

@router.post(
    "/",
    response_model=OrganizacionRead,
    dependencies=[Depends(role_required_at_most(ROLE_ADMIN))]  # admin (2) o superadmin (1)
)
def create_organization(
    data: OrganizacionCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """
    Crea una nueva Organización, asignándole automáticamente
    un plan 'Lite' (ID=1), con 15 días de prueba.
    (Acceso: rol_id <= 2 => Admin o Superadmin)
    """
    # 1) Lógica DV si NIT
    dv_calculado = None
    if data.tipo_documento_id and data.numero_documento:
        dv_calculado = calc_dv_if_nit(data.tipo_documento_id, data.numero_documento)

    # 2) Buscar plan Lite (ID=1)
    plan_lite = db.query(Plan).filter(Plan.id == 1).first()
    if not plan_lite:
        raise HTTPException(
            status_code=400,
            detail="No existe el plan Lite (ID=1). Revisa la BD."
        )

    # 3) Fechas trial
    fecha_inicio = datetime.utcnow()
    fecha_fin = fecha_inicio + timedelta(days=15)

    # 4) Crear
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
    db.commit()
    db.refresh(org)

    log_event(db, current_user.id, "ORG_CREATED", f"Organización {org.nombre_fiscal} creada con plan Lite")
    return org


@router.get("/{org_id}", response_model=OrganizacionRead)
def get_organization(
    org_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """
    Obtiene la organización por ID.
    (Cualquier usuario autenticado puede acceder)
    """
    org = db.query(Organizacion).filter(Organizacion.id == org_id).first()
    if not org:
        raise HTTPException(status_code=404, detail="Organización no encontrada")
    return org


@router.put(
    "/{org_id}",
    response_model=OrganizacionRead,
    dependencies=[Depends(role_required_at_most(ROLE_ADMIN))]  # Admin o superadmin
)
def update_organization(
    org_id: int,
    data: OrganizacionCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """
    Actualiza una Organización existente.
    (Acceso: rol_id <= 2 => Admin o Superadmin)
    """
    org = db.query(Organizacion).filter(Organizacion.id == org_id).first()
    if not org:
        raise HTTPException(status_code=404, detail="Organización no encontrada")

    fields = data.dict(exclude_unset=True)

    # Recalcular DV si cambian tipo_documento y número
    if "tipo_documento_id" in fields and "numero_documento" in fields:
        org.dv = calc_dv_if_nit(fields["tipo_documento_id"], fields["numero_documento"])

    # Actualizar campos
    if "tipo_documento_id" in fields:
        org.tipo_documento_id = fields["tipo_documento_id"]
    if "numero_documento" in fields:
        org.numero_documento = fields["numero_documento"]
    if "nombre_fiscal" in fields:
        org.nombre_fiscal = fields["nombre_fiscal"]
    if "nombre_comercial" in fields:
        org.nombre_comercial = fields["nombre_comercial"]
    if "nombre_corto" in fields:
        org.nombre_corto = fields["nombre_corto"]
    if "obligado_contabilidad" in fields:
        org.obligado_contabilidad = fields["obligado_contabilidad"]
    if "email_principal" in fields:
        org.email_principal = fields["email_principal"]
    if "email_alertas_facturacion" in fields:
        org.email_alertas_facturacion = fields["email_alertas_facturacion"]
    if "email_alertas_soporte" in fields:
        org.email_alertas_soporte = fields["email_alertas_soporte"]
    if "celular_whatsapp" in fields:
        org.celular_whatsapp = fields["celular_whatsapp"]
    if "pagina_web" in fields:
        org.pagina_web = fields["pagina_web"]
    if "encabezado_personalizado" in fields:
        org.encabezado_personalizado = fields["encabezado_personalizado"]
    if "dias_dudoso_recaudo" in fields:
        org.dias_dudoso_recaudo = fields["dias_dudoso_recaudo"]
    if "recibir_copia_email_documentos_electronicos" in fields:
        org.recibir_copia_email_documentos_electronicos = fields["recibir_copia_email_documentos_electronicos"]
    if "politica_garantias" in fields:
        org.politica_garantias = fields["politica_garantias"]

    db.commit()
    db.refresh(org)
    log_event(db, current_user.id, "ORG_UPDATED", f"Organización {org.id} actualizada")
    return org


@router.delete(
    "/{org_id}",
    dependencies=[Depends(role_required_at_most(ROLE_SUPERADMIN))]  # solo superadmin
)
def delete_organization(
    org_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """
    Elimina la Organización por ID.
    (Acceso: rol_id <= 1 => solo superadmin)
    """
    org = db.query(Organizacion).filter(Organizacion.id == org_id).first()
    if not org:
        raise HTTPException(status_code=404, detail="Organización no encontrada")

    db.delete(org)
    db.commit()

    log_event(db, current_user.id, "ORG_DELETED", f"Organización {org_id} eliminada")
    return {"message": f"Organización {org_id} eliminada con éxito"}


@router.put(
    "/{org_id}/set_plan/{plan_id}",
    dependencies=[Depends(role_required_at_most(ROLE_SUPERADMIN))]  # solo superadmin
)
def set_organization_plan(
    org_id: int,
    plan_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """
    Asigna el plan con ID = plan_id a la organización org_id.
    Puede usarse para cambiar de plan o actualizar vigencia.
    (Acceso: rol_id <= 1 => solo superadmin)
    """
    org = db.query(Organizacion).filter(Organizacion.id == org_id).first()
    if not org:
        raise HTTPException(status_code=404, detail="Organización no encontrada")

    plan = db.query(Plan).filter(Plan.id == plan_id).first()
    if not plan:
        raise HTTPException(status_code=404, detail="Plan no encontrado")

    org.plan_id = plan_id
    # Ej: reiniciar trial, actualizar fechas, etc.
    # org.fecha_inicio_plan = datetime.utcnow()
    # org.fecha_fin_plan = ...
    # org.trial_activo = False

    db.commit()
    db.refresh(org)

    log_event(db, current_user.id, "ORG_PLAN_UPDATED", f"Plan {plan.nombre_plan} asignado a org {org_id}")

    return {
        "message": f"Plan {plan.nombre_plan} asignado a la organización {org_id}",
        "plan": plan.nombre_plan
    }

#
# =============================================================================
#                              SUCURSALES
# =============================================================================
#

@router.get("/{org_id}/sucursales", response_model=PaginatedSucursales)
def list_sucursales(
    org_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
    search: str | None = None,
    page: int = 1,
    page_size: int = 10
):
    org = db.query(Organizacion).filter(Organizacion.id == org_id).first()
    if not org:
        raise HTTPException(status_code=404, detail="Organización no encontrada")

    query = db.query(Sucursal).filter(Sucursal.organizacion_id == org_id)

    if search:
        query = query.filter(Sucursal.nombre.ilike(f"%{search}%"))

    total_registros = query.count()
    total_paginas = max((total_registros + page_size - 1) // page_size, 1)
    if page > total_paginas:
        page = total_paginas

    offset = (page - 1) * page_size

    # 🔹 Aquí vienene joinedload (u otra forma de eager loading):
    sucursales_db = (query
                     .options(
                         joinedload(Sucursal.departamento),
                         joinedload(Sucursal.ciudad)
                     )
                     .offset(offset)
                     .limit(page_size)
                     .all()
                    )

    data = [SucursalRead.from_orm(s) for s in sucursales_db]

    return {
        "data": data,
        "page": page,
        "total_paginas": total_paginas,
        "total_registros": total_registros
    }

@router.post(
    "/{org_id}/sucursales",
    response_model=SucursalRead,
    dependencies=[Depends(role_required_at_most(ROLE_ADMIN))]
)
def create_sucursal(
    org_id: int,
    data: SucursalCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """
    Crea una nueva Sucursal para la organización {org_id}.
    (Acceso: rol_id <= 2 => Admin o Superadmin)
    """
    org = db.query(Organizacion).filter(Organizacion.id == org_id).first()
    if not org:
        raise HTTPException(status_code=404, detail="Organización no encontrada")

    # Verificar que data.organizacion_id == org_id (por coherencia)
    if data.organizacion_id != org_id:
        raise HTTPException(
            status_code=400,
            detail="El organizacion_id no coincide con la URL"
        )

    # 🔹 Validar si esta sucursal viene como principal => Chequear que no exista otra
    if data.sucursal_principal:
        existing_principal = db.query(Sucursal).filter(
            Sucursal.organizacion_id == org_id,
            Sucursal.sucursal_principal == True
        ).first()
        if existing_principal:
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
    db.commit()
    db.refresh(nueva_sucursal)

    log_event(
        db, 
        current_user.id, 
        "SUCURSAL_CREATED", 
        f"Sucursal {nueva_sucursal.nombre} creada en Org {org_id}"
    )
    return nueva_sucursal



@router.get("/{org_id}/sucursales/{sucursal_id}", response_model=SucursalRead)
def get_sucursal(
    org_id: int,
    sucursal_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """
    Retorna la sucursal {sucursal_id} perteneciente a la organización {org_id}.
    (Cualquier usuario autenticado)
    """
    suc = db.query(Sucursal).filter(
        Sucursal.id == sucursal_id,
        Sucursal.organizacion_id == org_id
    ).first()
    if not suc:
        raise HTTPException(status_code=404, detail="Sucursal no encontrada o no pertenece a la organización.")
    return suc


@router.patch(
    "/{org_id}/sucursales/{sucursal_id}",
    response_model=SucursalRead,
    dependencies=[Depends(role_required_at_most(ROLE_ADMIN))]
)
def patch_sucursal(
    org_id: int,
    sucursal_id: int,
    data: SucursalUpdate,  # <-- Usas SucursalUpdate
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """
    Actualiza parcialmente la sucursal {sucursal_id} de la organización {org_id}.
    (Acceso: rol_id <= 2 => Admin o Superadmin)
    """
    suc = db.query(Sucursal).filter(
        Sucursal.id == sucursal_id,
        Sucursal.organizacion_id == org_id
    ).first()

    if not suc:
        raise HTTPException(
            status_code=404,
            detail="Sucursal no encontrada o no pertenece a la organización."
        )

    # Convertimos data a dict, excluyendo campos no enviados
    campos = data.dict(exclude_unset=True)

    # Si 'organizacion_id' fue enviado y no coincide => error
    if "organizacion_id" in campos and campos["organizacion_id"] != org_id:
        raise HTTPException(
            status_code=400,
            detail="El organizacion_id no coincide con la URL"
        )

    # Asignar cada campo al modelo si vino en 'campos'
    if "nombre" in campos:
        suc.nombre = campos["nombre"]
    if "pais" in campos:
        suc.pais = campos["pais"]
    if "departamento_id" in campos:
        suc.departamento_id = campos["departamento_id"]
    if "ciudad_id" in campos:
        suc.ciudad_id = campos["ciudad_id"]
    if "direccion" in campos:
        suc.direccion = campos["direccion"]
    if "telefonos" in campos:
        suc.telefonos = campos["telefonos"]
    if "prefijo_transacciones" in campos:
        suc.prefijo_transacciones = campos["prefijo_transacciones"]
    if "sucursal_principal" in campos:
        suc.sucursal_principal = campos["sucursal_principal"]
    if "activa" in campos:
        suc.activa = campos["activa"]

    db.commit()
    db.refresh(suc)

    log_event(db, current_user.id, "SUCURSAL_UPDATED", f"Sucursal {suc.id} actualizada (PATCH)")

    return suc

@router.delete(
    "/{org_id}/sucursales/{sucursal_id}",
    dependencies=[Depends(role_required_at_most(ROLE_ADMIN))]
)
def delete_sucursal(
    org_id: int,
    sucursal_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """
    Elimina la sucursal {sucursal_id} de la organización {org_id}.
    Lanza un error 400 si hay registros asociados (IntegrityError).
    Acceso: rol_id <= ROLE_ADMIN (2).
    """

    suc = db.query(Sucursal).filter(
        Sucursal.id == sucursal_id,
        Sucursal.organizacion_id == org_id
    ).first()
    if not suc:
        raise HTTPException(
            status_code=404,
            detail="Sucursal no encontrada o no pertenece a la organización."
        )

    try:
        db.delete(suc)
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=400,
            detail="No se puede eliminar la sucursal porque tiene registros asociados."
        )

    log_event(
        db,
        current_user.id,
        "SUCURSAL_DELETED",
        f"Sucursal {sucursal_id} eliminada de Org {org_id}"
    )

    return {"message": f"Sucursal {sucursal_id} eliminada con éxito."}


#
# =============================================================================
#                               CENTROS DE COSTO
# =============================================================================
#

@router.get("/{org_id}/centros_costos", response_model=PaginatedCentrosCostos)
def list_centros_costos(
    org_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
    search: Optional[str] = Query(None),
    page: int = 1,
    page_size: int = 10
):
    """
    Lista paginada de centros de costo de la organización {org_id}.
    Retorna {data, page, total_paginas, total_registros}.
    """
    org = db.query(Organizacion).filter(Organizacion.id == org_id).first()
    if not org:
        raise HTTPException(status_code=404, detail="Organización no encontrada")

    # Base query
    query = db.query(CentroCosto).filter(CentroCosto.organizacion_id == org_id)

    # Ejemplo: buscar por "nombre" o "codigo"
    if search:
        query = query.filter(
            (CentroCosto.nombre.ilike(f"%{search}%"))
            | (CentroCosto.codigo.ilike(f"%{search}%"))
        )

    total_registros = query.count()
    total_paginas = max((total_registros + page_size - 1) // page_size, 1)
    if page > total_paginas:
        page = total_paginas

    offset = (page - 1) * page_size
    centros_db = query.offset(offset).limit(page_size).all()

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
def create_centro_costo(
    org_id: int,
    data: CentroCostoCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """
    Crea un nuevo Centro de Costo en la organización {org_id}.
    (rol <= Admin)
    """
    org = db.query(Organizacion).filter(Organizacion.id == org_id).first()
    if not org:
        raise HTTPException(status_code=404, detail="Organización no encontrada")

    if data.organizacion_id != org_id:
        raise HTTPException(
            status_code=400,
            detail="El organizacion_id no coincide con la URL"
        )

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
    db.commit()
    db.refresh(nuevo_centro)

    log_event(db, current_user.id, "CC_CREATED", f"Centro de costo {nuevo_centro.codigo} creado en Org {org_id}")
    return nuevo_centro


@router.get("/{org_id}/centros_costos/{centro_id}", response_model=CentroCostoRead)
def get_centro_costo(
    org_id: int,
    centro_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """
    Retorna el Centro de Costo {centro_id} de la organización {org_id}.
    """
    cc = db.query(CentroCosto).filter(
        CentroCosto.id == centro_id,
        CentroCosto.organizacion_id == org_id
    ).first()
    if not cc:
        raise HTTPException(status_code=404, detail="Centro de costo no encontrado o no pertenece a la organización.")
    return cc


@router.put("/{org_id}/centros_costos/{centro_id}",
    response_model=CentroCostoRead,
    dependencies=[Depends(role_required_at_most(ROLE_ADMIN))])
def update_centro_costo(
    org_id: int,
    centro_id: int,
    data: CentroCostoCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """
    Actualiza el Centro de Costo {centro_id} de la organización {org_id}.
    (rol <= Admin)
    """
    cc = db.query(CentroCosto).filter(
        CentroCosto.id == centro_id,
        CentroCosto.organizacion_id == org_id
    ).first()
    if not cc:
        raise HTTPException(status_code=404, detail="Centro de costo no encontrado.")

    fields = data.dict(exclude_unset=True)
    if "organizacion_id" in fields and fields["organizacion_id"] != org_id:
        raise HTTPException(
            status_code=400,
            detail="El organizacion_id no coincide con la URL"
        )

    cc.codigo = fields.get("codigo", cc.codigo)
    cc.nombre = fields.get("nombre", cc.nombre)
    cc.nivel = fields.get("nivel", cc.nivel)
    cc.padre_id = fields.get("padre_id", cc.padre_id)
    cc.permite_ingresos = fields.get("permite_ingresos", cc.permite_ingresos)
    cc.estado = fields.get("estado", cc.estado)

    db.commit()
    db.refresh(cc)
    log_event(db, current_user.id, "CC_UPDATED", f"Centro de costo {cc.id} actualizado")
    return cc


@router.delete("/{org_id}/centros_costos/{centro_id}",
    dependencies=[Depends(role_required_at_most(ROLE_ADMIN))])
def delete_centro_costo(
    org_id: int,
    centro_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """
    Elimina el Centro de Costo {centro_id} de la organización {org_id}.
    (rol <= Admin)
    """
    cc = db.query(CentroCosto).filter(
        CentroCosto.id == centro_id,
        CentroCosto.organizacion_id == org_id
    ).first()
    if not cc:
        raise HTTPException(status_code=404, detail="Centro de costo no encontrado.")

    db.delete(cc)
    db.commit()
    log_event(db, current_user.id, "CC_DELETED", f"Centro de costo {centro_id} eliminado de Org {org_id}")
    return {"message": f"Centro de costo {centro_id} eliminado con éxito."}
#
# =============================================================================
#                                BODEGAS
# =============================================================================
#

@router.post("/{org_id}/bodegas", response_model=BodegaRead, dependencies=[Depends(role_required_at_most(ROLE_ADMIN))])
def create_bodega(
    org_id: int,
    data: BodegaCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    org = db.query(Organizacion).filter(Organizacion.id == org_id).first()
    if not org:
        raise HTTPException(status_code=404, detail="Organización no encontrada")

    if data.organizacion_id != org_id:
        raise HTTPException(status_code=400, detail="El organizacion_id no coincide con la URL")

    nueva_bodega = Bodega(
        organizacion_id=org_id,
        sucursal_id=data.sucursal_id,
        nombre=data.nombre,
        bodega_por_defecto=data.bodega_por_defecto,
        estado=data.estado
    )
    db.add(nueva_bodega)
    db.commit()
    db.refresh(nueva_bodega)

    log_event(db, current_user.id, "BODEGA_CREATED", f"Bodega {nueva_bodega.nombre} creada en Org {org_id}")
    return nueva_bodega


@router.get("/{org_id}/bodegas/{bodega_id}", response_model=BodegaRead)
def get_bodega(
    org_id: int,
    bodega_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    bod = db.query(Bodega).filter(
        Bodega.id == bodega_id,
        Bodega.organizacion_id == org_id
    ).first()
    if not bod:
        raise HTTPException(status_code=404, detail="Bodega no encontrada.")
    return bod

@router.get("/{org_id}/bodegas", response_model=PaginatedBodegas)
def list_bodegas(
    org_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
    search: str = Query(None),
    page: int = 1,
    page_size: int = 10
):
    """
    Lista paginada de bodegas con la sucursal anidada.
    """
    org = db.query(Organizacion).filter(Organizacion.id == org_id).first()
    if not org:
        raise HTTPException(404, "Organización no encontrada")
    
    # Query con joinedload
    query = db.query(Bodega).options(joinedload(Bodega.sucursal)) \
                .filter(Bodega.organizacion_id == org_id)
    
    if search:
        query = query.filter(Bodega.nombre.ilike(f"%{search}%"))
    
    total_registros = query.count()
    total_paginas = max((total_registros + page_size - 1)//page_size, 1)
    if page > total_paginas:
        page = total_paginas
    offset = (page - 1)*page_size
    
    bodegas_db = query.offset(offset).limit(page_size).all()
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
def update_bodega(
    org_id: int,
    bodega_id: int,
    data: BodegaCreate,          # <= tu esquema pydantic
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """
    Actualiza la Bodega {bodega_id} de la organización {org_id}.
    (rol <= admin)
    """
    bod = db.query(Bodega).filter(
        Bodega.id == bodega_id,
        Bodega.organizacion_id == org_id
    ).first()
    if not bod:
        raise HTTPException(status_code=404, detail="Bodega no encontrada.")

    fields = data.dict(exclude_unset=True)

    # Validación de organizacion_id
    if "organizacion_id" in fields and fields["organizacion_id"] != org_id:
        raise HTTPException(status_code=400, detail="El organizacion_id no coincide con la URL")

    # Lógica para "bodega_por_defecto" => si es True, poner en false todas las demás
    if fields.get("bodega_por_defecto", False) is True:
        # Desactivar "bodega_por_defecto" en las otras bodegas de la misma org
        db.query(Bodega).filter(
            Bodega.organizacion_id == org_id,
            Bodega.id != bodega_id
        ).update({Bodega.bodega_por_defecto: False})
        db.commit()

    # Asignar los campos
    bod.sucursal_id = fields.get("sucursal_id", bod.sucursal_id)
    bod.nombre = fields.get("nombre", bod.nombre)
    bod.bodega_por_defecto = fields.get("bodega_por_defecto", bod.bodega_por_defecto)
    bod.estado = fields.get("estado", bod.estado)

    db.commit()
    db.refresh(bod)

    log_event(db, current_user.id, "BODEGA_UPDATED", f"Bodega {bod.id} actualizada")
    return bod



@router.delete("/{org_id}/bodegas/{bodega_id}", dependencies=[Depends(role_required_at_most(ROLE_ADMIN))])
def delete_bodega(
    org_id: int,
    bodega_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    bod = db.query(Bodega).filter(
        Bodega.id == bodega_id,
        Bodega.organizacion_id == org_id
    ).first()
    if not bod:
        raise HTTPException(status_code=404, detail="Bodega no encontrada...")

    db.delete(bod)
    db.commit()
    log_event(db, current_user.id, "BODEGA_DELETED", f"Bodega {bodega_id} eliminada de Org {org_id}")
    return {"message": f"Bodega {bodega_id} eliminada con éxito."}


#
# =============================================================================
#                                 CAJAS
# =============================================================================
#

@router.post(
    "/{org_id}/cajas",
    response_model=CajaRead,
    dependencies=[Depends(role_required_at_most(ROLE_ADMIN))]
)
def create_caja(
    org_id: int,
    data: CajaCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """
    Crea una nueva Caja para la organización {org_id}.
    (Acceso: rol_id <= 2 => Admin o Superadmin)
    """
    org = db.query(Organizacion).filter(Organizacion.id == org_id).first()
    if not org:
        raise HTTPException(status_code=404, detail="Organización no encontrada")

    if data.organizacion_id != org_id:
        raise HTTPException(status_code=400, detail="El organizacion_id no coincide con la URL")

    nueva_caja = Caja(
        organizacion_id=org_id,
        nombre=data.nombre,
        sucursal_id=data.sucursal_id,
        estado=data.estado,
        vigencia=data.vigencia
    )
    db.add(nueva_caja)
    db.commit()
    db.refresh(nueva_caja)

    log_event(db, current_user.id, "CAJA_CREATED", f"Caja {nueva_caja.nombre} creada en Org {org_id}")
    return nueva_caja


@router.get("/{org_id}/cajas", response_model=PaginatedCajas)
def list_cajas(
    org_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
    search: Optional[str] = Query(None),
    page: int = 1,
    page_size: int = 10
):
    """
    Lista todas las Cajas con la sucursal anidada.
    Retorna { data, page, total_paginas, total_registros }.
    """
    org = db.query(Organizacion).filter(Organizacion.id == org_id).first()
    if not org:
        raise HTTPException(status_code=404, detail="Organización no encontrada")

    # Query con joinedload para que 'caja.sucursal' cargue
    query = db.query(Caja).options(joinedload(Caja.sucursal)) \
                .filter(Caja.organizacion_id == org_id)

    # Búsqueda
    if search:
        query = query.filter(Caja.nombre.ilike(f"%{search}%"))

    # Paginación
    total_registros = query.count()
    total_paginas = max((total_registros + page_size - 1) // page_size, 1)
    if page > total_paginas:
        page = total_paginas

    offset = (page - 1) * page_size
    cajas_db = query.offset(offset).limit(page_size).all()

    # Convertir a Pydantic (CajaRead) para que anide sucursal
    data = [CajaRead.from_orm(caja) for caja in cajas_db]

    return {
        "data": data,
        "page": page,
        "total_paginas": total_paginas,
        "total_registros": total_registros
    }

@router.put(
    "/{org_id}/cajas/{caja_id}",
    response_model=CajaRead,
    dependencies=[Depends(role_required_at_most(ROLE_ADMIN))]
)
def update_caja(
    org_id: int,
    caja_id: int,
    data: CajaCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """
    Actualiza la Caja {caja_id} de la organización {org_id}.
    (Acceso: rol_id <= 2 => Admin o Superadmin)
    """
    caja = db.query(Caja).filter(
        Caja.id == caja_id,
        Caja.organizacion_id == org_id
    ).first()
    if not caja:
        raise HTTPException(status_code=404, detail="Caja no encontrada o no pertenece a la organización.")

    fields = data.dict(exclude_unset=True)
    if "organizacion_id" in fields and fields["organizacion_id"] != org_id:
        raise HTTPException(status_code=400, detail="El organizacion_id no coincide con la URL")

    caja.nombre = fields.get("nombre", caja.nombre)
    caja.sucursal_id = fields.get("sucursal_id", caja.sucursal_id)
    caja.estado = fields.get("estado", caja.estado)
    caja.vigencia = fields.get("vigencia", caja.vigencia)

    db.commit()
    db.refresh(caja)
    log_event(db, current_user.id, "CAJA_UPDATED", f"Caja {caja.id} actualizada")
    return caja


@router.delete(
    "/{org_id}/cajas/{caja_id}",
    dependencies=[Depends(role_required_at_most(ROLE_ADMIN))]
)
def delete_caja(
    org_id: int,
    caja_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """
    Elimina la Caja {caja_id} de la organización {org_id}.
    (Acceso: rol_id <= 2 => Admin o Superadmin)
    """
    caja = db.query(Caja).filter(
        Caja.id == caja_id,
        Caja.organizacion_id == org_id
    ).first()
    if not caja:
        raise HTTPException(status_code=404, detail="Caja no encontrada o no pertenece a la organización.")

    db.delete(caja)
    db.commit()
    log_event(db, current_user.id, "CAJA_DELETED", f"Caja {caja_id} eliminada de Org {org_id}")
    return {"message": f"Caja {caja_id} eliminada con éxito."}

#
# =============================================================================
#                           TIENDAS VIRTUALES
# =============================================================================
#

@router.post("/{org_id}/tiendas_virtuales",
    response_model=TiendaVirtualRead,
    dependencies=[Depends(role_required_at_most(ROLE_ADMIN))])
def create_tienda_virtual(
    org_id: int,
    data: TiendaVirtualCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """
    Crea una nueva Tienda Virtual para la org {org_id}.
    (Rol <= Admin o Superadmin)
    """
    org = db.query(Organizacion).filter(Organizacion.id == org_id).first()
    if not org:
        raise HTTPException(status_code=404, detail="Organización no encontrada")

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
    db.commit()
    db.refresh(nueva_tienda)

    log_event(db, current_user.id, "TIENDA_CREATED", f"Tienda Virtual {nueva_tienda.nombre} creada en Org {org_id}")
    return nueva_tienda

@router.get("/{org_id}/tiendas_virtuales", response_model=PaginatedTiendasVirtuales)
def list_tiendas_virtuales(
    org_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
    search: Optional[str] = Query(None),
    page: int = 1,
    page_size: int = 10
):
    """
    Lista paginada de Tiendas Virtuales de la organización {org_id},
    con filtro 'search' en campos 'nombre' o 'plataforma' o 'url'.
    """
    org = db.query(Organizacion).filter(Organizacion.id == org_id).first()
    if not org:
        raise HTTPException(404, "Organización no encontrada")

    query = db.query(TiendaVirtual).filter(
        TiendaVirtual.organizacion_id == org_id
    )

    if search:
        search_like = f"%{search}%"
        query = query.filter(or_(
            TiendaVirtual.nombre.ilike(search_like),
            TiendaVirtual.plataforma.ilike(search_like),
            TiendaVirtual.url.ilike(search_like),
        ))

    total_registros = query.count()
    total_paginas = max((total_registros + page_size - 1)//page_size, 1)
    if page > total_paginas:
        page = total_paginas
    offset = (page - 1)*page_size

    tv_db = query.offset(offset).limit(page_size).all()
    data = [TiendaVirtualRead.from_orm(t) for t in tv_db]

    return {
        "data": data,
        "page": page,
        "total_paginas": total_paginas,
        "total_registros": total_registros
    }

@router.get("/{org_id}/tiendas_virtuales/{tienda_id}",
    response_model=TiendaVirtualRead)
def get_tienda_virtual(
    org_id: int,
    tienda_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """
    Retorna la Tienda Virtual {tienda_id} de la org {org_id}.
    """
    tv = db.query(TiendaVirtual).filter(
        TiendaVirtual.id == tienda_id,
        TiendaVirtual.organizacion_id == org_id
    ).first()
    if not tv:
        raise HTTPException(404, "Tienda Virtual no encontrada o no pertenece a la organización.")
    return tv

@router.put("/{org_id}/tiendas_virtuales/{tienda_id}",
    response_model=TiendaVirtualRead,
    dependencies=[Depends(role_required_at_most(ROLE_ADMIN))])
def update_tienda_virtual(
    org_id: int,
    tienda_id: int,
    data: TiendaVirtualCreate,  # O un TiendaVirtualUpdate si prefieres
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """
    Actualiza la Tienda Virtual {tienda_id} de la org {org_id}.
    (Rol <= Admin)
    """
    tv = db.query(TiendaVirtual).filter(
        TiendaVirtual.id == tienda_id,
        TiendaVirtual.organizacion_id == org_id
    ).first()
    if not tv:
        raise HTTPException(404, "Tienda Virtual no encontrada.")

    fields = data.dict(exclude_unset=True)

    if "organizacion_id" in fields and fields["organizacion_id"] != org_id:
        raise HTTPException(400, "El organizacion_id no coincide con la URL")

    tv.plataforma = fields.get("plataforma", tv.plataforma)
    tv.nombre = fields.get("nombre", tv.nombre)
    tv.url = fields.get("url", tv.url)
    tv.centro_costo_id = fields.get("centro_costo_id", tv.centro_costo_id)
    tv.estado = fields.get("estado", tv.estado)

    db.commit()
    db.refresh(tv)
    log_event(db, current_user.id, "TIENDA_UPDATED", f"Tienda Virtual {tv.id} actualizada")
    return tv

@router.delete("/{org_id}/tiendas_virtuales/{tienda_id}",
    dependencies=[Depends(role_required_at_most(ROLE_ADMIN))])
def delete_tienda_virtual(
    org_id: int,
    tienda_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """
    Elimina la Tienda Virtual {tienda_id} de la org {org_id}.
    (Rol <= Admin)
    """
    tv = db.query(TiendaVirtual).filter(
        TiendaVirtual.id == tienda_id,
        TiendaVirtual.organizacion_id == org_id
    ).first()
    if not tv:
        raise HTTPException(404, "Tienda Virtual no encontrada.")

    db.delete(tv)
    db.commit()
    log_event(db, current_user.id, "TIENDA_DELETED", f"Tienda Virtual {tienda_id} eliminada de Org {org_id}")
    return {"message": f"Tienda Virtual {tienda_id} eliminada con éxito."}


#
# =============================================================================
#                           NUMERACIONES DE TRANSACCION 
# =============================================================================
#

@router.post("/{org_id}/numeraciones",
    response_model=NumeracionTransaccionRead,
    dependencies=[Depends(role_required_at_most(ROLE_ADMIN))])
def create_numeracion_transaccion(
    org_id: int,
    data: NumeracionTransaccionCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """
    Crea una nueva Numeración de Transacción para la org {org_id}.
    """
    org = db.query(Organizacion).filter(Organizacion.id == org_id).first()
    if not org:
        raise HTTPException(404, "Organización no encontrada")

    if data.organizacion_id != org_id:
        raise HTTPException(400, "El organizacion_id no coincide con la URL")

    # Si es por_defecto => desactivar en las demás numeraciones de la misma org
    if data.numeracion_por_defecto:
        db.query(NumeracionTransaccion).filter(
            NumeracionTransaccion.organizacion_id == org_id
        ).update({NumeracionTransaccion.numeracion_por_defecto: False})
        db.commit()

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
    db.commit()
    db.refresh(nueva_num)
    return nueva_num

@router.get("/{org_id}/numeraciones", response_model=PaginatedNumeraciones)
def list_numeraciones_transaccion(
    org_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
    search: Optional[str] = Query(None),
    page: int = 1,
    page_size: int = 10
):
    """
    Lista paginada de numeraciones. Se puede buscar en 'nombre_personalizado' o 'titulo_transaccion'.
    """
    org = db.query(Organizacion).filter(Organizacion.id == org_id).first()
    if not org:
        raise HTTPException(404, "Organización no encontrada")

    query = db.query(NumeracionTransaccion).filter(
        NumeracionTransaccion.organizacion_id == org_id
    )

    if search:
        search_like = f"%{search}%"
        query = query.filter(or_(
            NumeracionTransaccion.nombre_personalizado.ilike(search_like),
            NumeracionTransaccion.titulo_transaccion.ilike(search_like)
        ))

    total_registros = query.count()
    total_paginas = max((total_registros + page_size - 1) // page_size, 1)
    if page > total_paginas:
        page = total_paginas

    offset = (page - 1) * page_size
    nums_db = query.offset(offset).limit(page_size).all()

    data = [NumeracionTransaccionRead.from_orm(n) for n in nums_db]
    return {
        "data": data,
        "page": page,
        "total_paginas": total_paginas,
        "total_registros": total_registros
    }

@router.get("/{org_id}/numeraciones/{num_id}", response_model=NumeracionTransaccionRead)
def get_numeracion_transaccion(
    org_id: int,
    num_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """
    Retorna la numeración {num_id} de la organización {org_id}.
    """
    num = db.query(NumeracionTransaccion).filter(
        NumeracionTransaccion.id == num_id,
        NumeracionTransaccion.organizacion_id == org_id
    ).first()
    if not num:
        raise HTTPException(404, "Numeración no encontrada.")
    return num

@router.put("/{org_id}/numeraciones/{num_id}",
    response_model=NumeracionTransaccionRead,
    dependencies=[Depends(role_required_at_most(ROLE_ADMIN))])
def update_numeracion_transaccion(
    org_id: int,
    num_id: int,
    data: NumeracionTransaccionCreate,  # Podrías crear un "NumeracionTransaccionUpdate" si deseas
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """
    Actualiza la Numeración {num_id} de la org {org_id}.
    """
    num = db.query(NumeracionTransaccion).filter(
        NumeracionTransaccion.id == num_id,
        NumeracionTransaccion.organizacion_id == org_id
    ).first()
    if not num:
        raise HTTPException(404, "Numeración no encontrada.")

    fields = data.dict(exclude_unset=True)

    if "organizacion_id" in fields and fields["organizacion_id"] != org_id:
        raise HTTPException(400, "El organizacion_id no coincide con la URL")

    # Si numeracion_por_defecto = True => desactivamos en las otras
    if fields.get("numeracion_por_defecto", False) is True:
        db.query(NumeracionTransaccion).filter(
            NumeracionTransaccion.organizacion_id == org_id,
            NumeracionTransaccion.id != num_id
        ).update({NumeracionTransaccion.numeracion_por_defecto: False})
        db.commit()

    # Asignar campos
    for key, value in fields.items():
        setattr(num, key, value)

    db.commit()
    db.refresh(num)
    return num

@router.delete("/{org_id}/numeraciones/{num_id}",
    dependencies=[Depends(role_required_at_most(ROLE_ADMIN))])
def delete_numeracion_transaccion(
    org_id: int,
    num_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """
    Elimina la Numeración {num_id} de la org {org_id}.
    """
    num = db.query(NumeracionTransaccion).filter(
        NumeracionTransaccion.id == num_id,
        NumeracionTransaccion.organizacion_id == org_id
    ).first()
    if not num:
        raise HTTPException(404, "Numeración no encontrada.")

    db.delete(num)
    db.commit()
    return {"message": f"Numeración {num_id} eliminada con éxito."}