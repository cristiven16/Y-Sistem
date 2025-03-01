# gestion_negocio/routes/proveedores.py

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func
from database import get_db
from schemas.proveedores import (
    ProveedorSchema,
    ProveedorResponseSchema,
    ProveedorUpdateSchema,  # <-- Importamos el nuevo esquema de actualización parcial
    PaginatedProveedores
)
from models.proveedores import Proveedor
from dependencies.auth import get_current_user
from services.dv_calculator import calc_dv_if_nit

router = APIRouter(prefix="/proveedores", tags=["Proveedores"], dependencies=[Depends(get_current_user)])

def normalize_text(text: str) -> str:
    """
    Remplaza las vocales acentuadas por vocales sin tilde.
    """
    return (
        text.replace("á", "a")
            .replace("é", "e")
            .replace("í", "i")
            .replace("ó", "o")
            .replace("ú", "u")
    )

@router.post("/", response_model=dict)
def crear_proveedor(proveedor: ProveedorSchema, db: Session = Depends(get_db)):
    """
    Crea un nuevo proveedor, recibiendo todos los campos requeridos en ProveedorSchema.
    """
    # 1) Normalizar
    proveedor.nombre_razon_social = proveedor.nombre_razon_social.upper()
    proveedor.numero_documento = normalize_text(proveedor.numero_documento).strip()

    # 2) Verificar duplicado en la misma organización
    existe_prov = db.query(Proveedor).filter(
        Proveedor.organizacion_id == proveedor.organizacion_id,
        Proveedor.numero_documento == proveedor.numero_documento
    ).first()
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
    db.commit()
    db.refresh(nuevo_proveedor)

    return {
        "message": "Proveedor creado con éxito",
        "id": nuevo_proveedor.id,
        "numero_documento": nuevo_proveedor.numero_documento
    }

@router.get("/", response_model=PaginatedProveedores)
def obtener_proveedores(
    db: Session = Depends(get_db),
    search: Optional[str] = Query(None, description="Texto de búsqueda"),
    page: int = Query(1, ge=1, description="Número de página"),
    page_size: int = 10
):
    """
    Retorna una lista paginada de proveedores, permitiendo búsqueda parcial en 'nombre_razon_social'.
    """
    query = db.query(Proveedor).options(
        joinedload(Proveedor.departamento),
        joinedload(Proveedor.ciudad)
    )

    # Búsqueda parcial
    if search:
        normalized = normalize_text(search).strip().lower()
        terms = normalized.split()
        for term in terms:
            query = query.filter(
                func.lower(Proveedor.nombre_razon_social).ilike(f"%{term}%")
            )

    total_registros = query.count()
    total_paginas = (total_registros + page_size - 1) // page_size if total_registros > 0 else 1

    if page > total_paginas:
        page = total_paginas

    offset = (page - 1) * page_size
    proveedores_db = query.offset(offset).limit(page_size).all()

    data = [ProveedorResponseSchema.from_orm(p) for p in proveedores_db]
    return {
        "data": data,
        "page": page,
        "total_paginas": total_paginas,
        "total_registros": total_registros
    }

@router.get("/{proveedor_id}", response_model=ProveedorResponseSchema)
def obtener_proveedor(
    proveedor_id: int,
    db: Session = Depends(get_db)
):
    """
    Obtiene un proveedor por su ID.
    """
    prov = db.query(Proveedor).filter(Proveedor.id == proveedor_id).first()
    if not prov:
        raise HTTPException(status_code=404, detail="Proveedor no encontrado")
    return prov

@router.patch("/{proveedor_id}", response_model=ProveedorResponseSchema)
def actualizar_proveedor_parcial(
    proveedor_id: int,
    proveedor_data: ProveedorUpdateSchema,
    db: Session = Depends(get_db)
):
    """
    Actualiza de manera parcial los campos del proveedor (solo los enviados).
    """
    prov_db = db.query(Proveedor).filter(Proveedor.id == proveedor_id).first()
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
            existe = db.query(Proveedor).filter(
                Proveedor.organizacion_id == org_id,
                Proveedor.numero_documento == doc_nuevo,
                Proveedor.id != prov_db.id
            ).first()
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

    db.commit()
    db.refresh(prov_db)
    return prov_db

@router.delete("/{proveedor_id}")
def eliminar_proveedor(
    proveedor_id: int,
    db: Session = Depends(get_db)
):
    prov_db = db.query(Proveedor).filter(Proveedor.id == proveedor_id).first()
    if not prov_db:
        raise HTTPException(status_code=404, detail="Proveedor no encontrado")

    db.delete(prov_db)
    db.commit()
    return {"message": "Proveedor eliminado correctamente"}
