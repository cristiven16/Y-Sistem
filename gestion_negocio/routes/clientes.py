from typing import List, Optional, Any
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func
from database import get_db
from schemas.clientes import (
    ClienteSchema,
    ClienteResponseSchema,
    PaginatedClientes  # <-- Nuevo schema
)
from models.clientes import Cliente

router = APIRouter(prefix="/clientes", tags=["Clientes"])

def normalize_text(text: str) -> str:
    """Remplaza las vocales acentuadas por vocales sin tilde."""
    return (text.replace("á", "a")
                .replace("é", "e")
                .replace("í", "i")
                .replace("ó", "o")
                .replace("ú", "u"))


# ─────────────────────────────────────────────────────────────
# POST /clientes -> Crear un nuevo cliente
# (con subobjetos tipo_documento, departamento, ciudad)
# ─────────────────────────────────────────────────────────────
@router.post("/", response_model=dict)
def crear_cliente(cliente: ClienteSchema, db: Session = Depends(get_db)):
    # 1) Convertir nombre a mayúsculas
    cliente.nombre_razon_social = cliente.nombre_razon_social.upper()
    # 2) Normalizar y quitar espacios en el documento
    cliente.numero_documento = normalize_text(cliente.numero_documento).strip()

    # 3) Verificar si ya existe ese número de documento
    existe_cliente = db.query(Cliente).filter(
        Cliente.numero_documento == cliente.numero_documento
    ).first()
    if existe_cliente:
        raise HTTPException(
            status_code=400,
            detail="El número de identificación ya está registrado."
        )

    # 4) Extraer los IDs de subobjetos
    tipo_documento_id = cliente.tipo_documento.id if cliente.tipo_documento else None
    departamento_id = cliente.departamento.id if cliente.departamento else None
    ciudad_id = cliente.ciudad.id if cliente.ciudad else None
    

    # 5) Crear el objeto de BD con las FK
    nuevo_cliente = Cliente(
        tipo_documento_id=tipo_documento_id,
        numero_documento=cliente.numero_documento,
        nombre_razon_social=cliente.nombre_razon_social,
        email=cliente.email,
        departamento_id=departamento_id,
        ciudad_id=ciudad_id,
        direccion=cliente.direccion,
        telefono1=cliente.telefono1,
        telefono2=cliente.telefono2,
        celular=cliente.celular,
        whatsapp=cliente.whatsapp,
        tipos_persona_id=cliente.tipos_persona_id,
        regimen_tributario_id=cliente.regimen_tributario_id,
        moneda_principal_id=cliente.moneda_principal_id,
        tarifa_precios_id=cliente.tarifa_precios_id,
        forma_pago_id=cliente.forma_pago_id,
        permitir_venta=cliente.permitir_venta,
        descuento=cliente.descuento,
        cupo_credito=cliente.cupo_credito,
        sucursal_id=cliente.sucursal_id,
        vendedor_id=cliente.vendedor_id,
        pagina_web=cliente.pagina_web,
        actividad_economica_id=cliente.actividad_economica_id,
        retencion_id=cliente.retencion_id,
        tipo_marketing_id=cliente.tipo_marketing_id,
        ruta_logistica_id=cliente.ruta_logistica_id,
        observacion=cliente.observacion
    )
    db.add(nuevo_cliente)
    db.commit()
    db.refresh(nuevo_cliente)

    return {
        "message": "Cliente creado con éxito",
        "id": nuevo_cliente.id,
        "numero_documento": nuevo_cliente.numero_documento
    }


# ─────────────────────────────────────────────────────────────
# GET /clientes -> Paginado y búsqueda parcial
# Devuelve { data, page, total_paginas, total_registros }
# ─────────────────────────────────────────────────────────────
@router.get("/", response_model=PaginatedClientes)
def obtener_clientes(
    db: Session = Depends(get_db),
    search: Optional[str] = Query(None, description="Texto de búsqueda"),
    page: int = Query(1, ge=1, description="Número de página a solicitar"),
    page_size: int = 10  # o Query(10, description="Registros por página")
):
    """
    Paginación desde el servidor con búsqueda parcial:
    - 'search' se separa por espacios => 'ca p' -> ['ca','p']
    - Cada término genera un ILIKE. => nombre_razon_social ILIKE '%ca%' ...
    - Devuelve:
      {
        data: [lista de clientes],
        page: X,
        total_paginas: Y,
        total_registros: Z
      }
    """

    query = db.query(Cliente).options(
        joinedload(Cliente.tipo_documento),
        joinedload(Cliente.departamento),
        joinedload(Cliente.ciudad)
    )

    # Búsqueda
    if search:
        # normalizar => remove tildes
        normalized_search = normalize_text(search).strip().lower()
        terms = normalized_search.split()
        for term in terms:
            query = query.filter(
                func.lower(Cliente.nombre_razon_social).ilike(f"%{term}%")
            )

    # Contar cuántos registros hay después del filtro
    total_registros = query.count()

    # Calcular cuántas páginas
    total_paginas = (total_registros + page_size - 1) // page_size if total_registros > 0 else 1

    # Asegurar que page no se pase de total_paginas
    if page > total_paginas:
        page = total_paginas

    offset = (page - 1) * page_size

    # Obtener la porción con offset+limit
    clientes_db = query.offset(offset).limit(page_size).all()

    # Serializar
    data = [ClienteResponseSchema.from_orm(c) for c in clientes_db]

    return {
        "data": data,
        "page": page,
        "total_paginas": total_paginas,
        "total_registros": total_registros
    }


# ─────────────────────────────────────────────────────────────
# PUT /clientes/{cliente_id} -> Actualizar
# ─────────────────────────────────────────────────────────────
@router.put("/{cliente_id}", response_model=ClienteResponseSchema)
def actualizar_cliente(
    cliente_id: int,
    cliente_actualizado: ClienteSchema,
    db: Session = Depends(get_db)
):
    cliente_db = db.query(Cliente).filter(Cliente.id == cliente_id).first()
    if not cliente_db:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")

    # Validar duplicado
    if cliente_actualizado.numero_documento != cliente_db.numero_documento:
        existe_cliente = db.query(Cliente).filter(
            Cliente.numero_documento == cliente_actualizado.numero_documento,
            Cliente.id != cliente_id
        ).first()
        if existe_cliente:
            raise HTTPException(
                status_code=400,
                detail=f"El número {cliente_actualizado.numero_documento} ya está registrado."
            )

    # Normalizar y mayúsculas
    cliente_actualizado.nombre_razon_social = (
        normalize_text(cliente_actualizado.nombre_razon_social).upper()
    )
    cliente_actualizado.numero_documento = (
        normalize_text(cliente_actualizado.numero_documento).strip()
    )

    # Extraer subobjetos
    tipo_documento_id = cliente_actualizado.tipo_documento.id if cliente_actualizado.tipo_documento else None
    departamento_id = cliente_actualizado.departamento.id if cliente_actualizado.departamento else None
    ciudad_id = cliente_actualizado.ciudad.id if cliente_actualizado.ciudad else None
    # 1) Extraer lo que venga del schema
    vendedor_id = cliente_actualizado.vendedor_id  # None o un int
    # 2) Asignarlo si corresponde
    cliente_db.vendedor_id = vendedor_id

    # Exclude fields that don't match the DB columns
    data_dict = cliente_actualizado.dict(exclude_unset=True)
    data_dict.pop("tipo_documento", None)
    data_dict.pop("departamento", None)
    data_dict.pop("ciudad", None)

    # Actualizar FKs
    if tipo_documento_id is not None:
        cliente_db.tipo_documento_id = tipo_documento_id
    if departamento_id is not None:
        cliente_db.departamento_id = departamento_id
    if ciudad_id is not None:
        cliente_db.ciudad_id = ciudad_id

    # Resto de campos
    for key, value in data_dict.items():
        setattr(cliente_db, key, value)

    db.commit()
    db.refresh(cliente_db)
    return cliente_db


# ─────────────────────────────────────────────────────────────
# DELETE /clientes/{cliente_id}
# ─────────────────────────────────────────────────────────────
@router.delete("/{cliente_id}")
def eliminar_cliente(cliente_id: int, db: Session = Depends(get_db)):
    cliente_db = db.query(Cliente).filter(Cliente.id == cliente_id).first()
    if not cliente_db:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")

    db.delete(cliente_db)
    db.commit()
    return {"message": "Cliente eliminado correctamente"}
