from typing import List, Optional, Any
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func
from database import get_db
from schemas.proveedores import (
    ProveedorSchema,
    ProveedorResponseSchema,
    PaginatedProveedores
)
from models.proveedores import Proveedor

router = APIRouter(prefix="/proveedores", tags=["Proveedores"])


def normalize_text(text: str) -> str:
    """
    Remplaza las vocales acentuadas por vocales sin tilde.
    (Idéntico a lo que usas en clientes, para manejar búsquedas o normalizaciones)
    """
    return (
        text.replace("á", "a")
            .replace("é", "e")
            .replace("í", "i")
            .replace("ó", "o")
            .replace("ú", "u")
    )

# ─────────────────────────────────────────────────────────────
# POST /proveedores -> Crear un nuevo proveedor
# (con subobjetos tipo_documento, departamento, ciudad, etc.)
# ─────────────────────────────────────────────────────────────
@router.post("/", response_model=dict)
def crear_proveedor(proveedor: ProveedorSchema, db: Session = Depends(get_db)):
    """
    Crea un nuevo proveedor. Usa subobjetos 'tipo_documento', 'departamento', 'ciudad' 
    si así lo definiste en el schema ProveedorSchema.
    """
    # 1) Convertir nombre a mayúsculas
    proveedor.nombre_razon_social = proveedor.nombre_razon_social.upper()
    # 2) Normalizar y quitar espacios en el documento
    proveedor.numero_documento = normalize_text(proveedor.numero_documento).strip()

    # 3) Verificar si ya existe ese número de documento
    existe_proveedor = db.query(Proveedor).filter(
        Proveedor.numero_documento == proveedor.numero_documento
    ).first()
    if existe_proveedor:
        raise HTTPException(
            status_code=400,
            detail="El número de identificación ya está registrado en Proveedores."
        )

    # 4) Extraer IDs de subobjetos (si tu schema define 'tipo_documento', 'departamento', etc.)
    tipo_documento_id = proveedor.tipo_documento.id if proveedor.tipo_documento else None
    departamento_id = proveedor.departamento.id if proveedor.departamento else None
    ciudad_id = proveedor.ciudad.id if proveedor.ciudad else None

    # 5) Crear el objeto de BD con las FK
    nuevo_proveedor = Proveedor(
        tipo_documento_id=tipo_documento_id,
        numero_documento=proveedor.numero_documento,
        nombre_razon_social=proveedor.nombre_razon_social,
        email=proveedor.email,
        departamento_id=departamento_id,
        ciudad_id=ciudad_id,
        direccion=proveedor.direccion,
        telefono1=proveedor.telefono1,
        telefono2=proveedor.telefono2,
        celular=proveedor.celular,
        whatsapp=proveedor.whatsapp,

        tipos_persona_id=proveedor.tipos_persona_id,
        regimen_tributario_id=proveedor.regimen_tributario_id,
        moneda_principal_id=proveedor.moneda_principal_id,
        tarifa_precios_id=proveedor.tarifa_precios_id,
        forma_pago_id=proveedor.forma_pago_id,
        permitir_venta=proveedor.permitir_venta,
        descuento=proveedor.descuento,
        cupo_credito=proveedor.cupo_credito,
        sucursal_id=proveedor.sucursal_id,
        pagina_web=proveedor.pagina_web,
        actividad_economica_id=proveedor.actividad_economica_id,
        retencion_id=proveedor.retencion_id,
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

# ─────────────────────────────────────────────────────────────
# GET /proveedores -> Paginado y búsqueda parcial
# Devuelve { data, page, total_paginas, total_registros }
# ─────────────────────────────────────────────────────────────
@router.get("/", response_model=PaginatedProveedores)
def obtener_proveedores(
    db: Session = Depends(get_db),
    search: Optional[str] = Query(None, description="Texto de búsqueda"),
    page: int = Query(1, ge=1, description="Número de página a solicitar"),
    page_size: int = 10
):
    """
    Paginación desde el servidor con búsqueda parcial para proveedores.
    - 'search' se separa por espacios => 'pro v' -> ['pro','v']
    - Cada término genera un ILIKE => nombre_razon_social ILIKE '%pro%' ...
    - Devuelve objeto con data, page, total_paginas, total_registros
    """
    query = db.query(Proveedor).options(
        joinedload(Proveedor.tipo_documento),
        joinedload(Proveedor.departamento),
        joinedload(Proveedor.ciudad)
    )

    # Búsqueda
    if search:
        normalized_search = normalize_text(search).strip().lower()
        terms = normalized_search.split()
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

    # Serializar con ProveedorResponseSchema
    data = [ProveedorResponseSchema.from_orm(p) for p in proveedores_db]

    return {
        "data": data,
        "page": page,
        "total_paginas": total_paginas,
        "total_registros": total_registros
    }

# ─────────────────────────────────────────────────────────────
# PUT /proveedores/{proveedor_id} -> Actualizar
# ─────────────────────────────────────────────────────────────
@router.put("/{proveedor_id}", response_model=ProveedorResponseSchema)
def actualizar_proveedor(
    proveedor_id: int,
    proveedor_act: ProveedorSchema,
    db: Session = Depends(get_db)
):
    """
    Actualiza un proveedor existente.
    """
    prov_db = db.query(Proveedor).filter(Proveedor.id == proveedor_id).first()
    if not prov_db:
        raise HTTPException(status_code=404, detail="Proveedor no encontrado")

    # Validar duplicado en numero_documento si cambió
    if proveedor_act.numero_documento != prov_db.numero_documento:
        existe = db.query(Proveedor).filter(
            Proveedor.numero_documento == proveedor_act.numero_documento,
            Proveedor.id != proveedor_id
        ).first()
        if existe:
            raise HTTPException(
                status_code=400,
                detail=f"El número {proveedor_act.numero_documento} ya está registrado."
            )

    # Normalizar
    proveedor_act.nombre_razon_social = normalize_text(proveedor_act.nombre_razon_social).upper()
    proveedor_act.numero_documento = normalize_text(proveedor_act.numero_documento).strip()

    # Extraer subobjetos
    tipo_documento_id = proveedor_act.tipo_documento.id if proveedor_act.tipo_documento else None
    departamento_id = proveedor_act.departamento.id if proveedor_act.departamento else None
    ciudad_id = proveedor_act.ciudad.id if proveedor_act.ciudad else None

    # Exclude fields that aren't direct columns
    data_dict = proveedor_act.dict(exclude_unset=True)
    data_dict.pop("tipo_documento", None)
    data_dict.pop("departamento", None)
    data_dict.pop("ciudad", None)

    # Actualizar FKs
    if tipo_documento_id is not None:
        prov_db.tipo_documento_id = tipo_documento_id
    if departamento_id is not None:
        prov_db.departamento_id = departamento_id
    if ciudad_id is not None:
        prov_db.ciudad_id = ciudad_id

    # Resto de campos
    for key, value in data_dict.items():
        setattr(prov_db, key, value)

    db.commit()
    db.refresh(prov_db)
    return prov_db

# ─────────────────────────────────────────────────────────────
# DELETE /proveedores/{proveedor_id} -> Eliminar
# ─────────────────────────────────────────────────────────────
@router.delete("/{proveedor_id}")
def eliminar_proveedor(proveedor_id: int, db: Session = Depends(get_db)):
    """
    Elimina un proveedor existente.
    """
    prov_db = db.query(Proveedor).filter(Proveedor.id == proveedor_id).first()
    if not prov_db:
        raise HTTPException(status_code=404, detail="Proveedor no encontrado")

    db.delete(prov_db)
    db.commit()
    return {"message": "Proveedor eliminado correctamente"}
