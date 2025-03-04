from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func
from database import get_db
from schemas.clientes import (
    ClienteSchema,
    ClienteResponseSchema,
    PaginatedClientes,
)
from schemas.clientes import ClienteUpdateSchema  # <-- nuevo import
from models.clientes import Cliente
from dependencies.auth import get_current_user
from datetime import datetime
from services.dv_calculator import calc_dv_if_nit

router = APIRouter(prefix="/clientes", tags=["Clientes"], dependencies=[Depends(get_current_user)])

def normalize_text(text: str) -> str:
    return (text.replace("á", "a")
               .replace("é", "e")
               .replace("í", "i")
               .replace("ó", "o")
               .replace("ú", "u"))

@router.post("/", response_model=dict)
def crear_cliente(
    cliente: ClienteSchema, 
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    # Normalizar y mayúsculas
    cliente.nombre_razon_social = cliente.nombre_razon_social.upper()
    cliente.numero_documento = normalize_text(cliente.numero_documento).strip()

    # Verificar duplicado en la misma organizacion
    existe = db.query(Cliente).filter(
        Cliente.organizacion_id == cliente.organizacion_id,
        Cliente.numero_documento == cliente.numero_documento
    ).first()
    if existe:
        raise HTTPException(
            status_code=400,
            detail="El número de identificación ya existe para esta organización."
        )

    # Calcular DV si es NIT => se asume, por ejemplo, tipo_documento_id=2 => NIT
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

@router.get("/", response_model=PaginatedClientes)
def obtener_clientes(
    db: Session = Depends(get_db),
    search: Optional[str] = Query(None),
    page: int = 1,
    page_size: int = 10
):
    """
    Paginar clientes con filtrado por 'search' (sobre nombre_razon_social).
    """
    query = db.query(Cliente).options(
        joinedload(Cliente.departamento),
        joinedload(Cliente.ciudad)
    )

    if search:
        normalized_search = normalize_text(search).strip().lower()
        terms = normalized_search.split()
        for term in terms:
            query = query.filter(func.lower(Cliente.nombre_razon_social).ilike(f"%{term}%"))

    total_registros = query.count()
    total_paginas = max((total_registros + page_size - 1) // page_size, 1)

    if page > total_paginas:
        page = total_paginas

    offset = (page - 1) * page_size
    clientes_db = query.offset(offset).limit(page_size).all()

    data = [ClienteResponseSchema.from_orm(c) for c in clientes_db]

    return {
        "data": data,
        "page": page,
        "total_paginas": total_paginas,
        "total_registros": total_registros
    }

@router.get("/{cliente_id}", response_model=ClienteResponseSchema)
def obtener_cliente(
    cliente_id: int, 
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """
    Obtiene el cliente por su ID.
    """
    cliente_db = db.query(Cliente).filter(Cliente.id == cliente_id).first()
    if not cliente_db:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")

    return cliente_db

@router.patch("/{cliente_id}", response_model=ClienteResponseSchema)
def actualizar_parcial_cliente(
    cliente_id: int,
    cliente_data: ClienteUpdateSchema,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """
    Actualiza los campos que vengan en el JSON (partial update).
    """
    cliente_db = db.query(Cliente).filter(Cliente.id == cliente_id).first()
    if not cliente_db:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")

    # Convertimos a dict y excluimos campos no enviados
    campos = cliente_data.dict(exclude_unset=True)

    # Validar si cambia 'numero_documento' => checar duplicado
    if "numero_documento" in campos:
        doc_nuevo = normalize_text(campos["numero_documento"]).strip()
        if doc_nuevo != cliente_db.numero_documento:
            # Checar unique (org, numero_documento)
            existe = db.query(Cliente).filter(
                Cliente.organizacion_id == (campos.get("organizacion_id") or cliente_db.organizacion_id),
                Cliente.numero_documento == doc_nuevo,
                Cliente.id != cliente_db.id
            ).first()
            if existe:
                raise HTTPException(status_code=400, detail="Ya existe ese documento en la organización.")
            # Reasignar doc normalizado
            campos["numero_documento"] = doc_nuevo

    # Validar si 'organizacion_id' cambia
    if "organizacion_id" in campos and campos["organizacion_id"] != cliente_db.organizacion_id:
        # Se asume que lo permitimos. (Si no, raise error.)
        pass

    # Calcular DV si se cambió tipo_documento_id y numero_documento
    if "tipo_documento_id" in campos or "numero_documento" in campos:
        tdoc = campos.get("tipo_documento_id", cliente_db.tipo_documento_id)
        ndoc = campos.get("numero_documento", cliente_db.numero_documento)
        dv = calc_dv_if_nit(tdoc, ndoc)
        if dv:
            cliente_db.dv = dv

    # Asignar el resto de campos
    for key, value in campos.items():
        # Normalizar 'nombre_razon_social' si cambia
        if key == "nombre_razon_social" and value:
            value = normalize_text(value).upper()
        setattr(cliente_db, key, value)

    db.commit()
    db.refresh(cliente_db)
    return cliente_db

@router.delete("/{cliente_id}")
def eliminar_cliente(
    cliente_id: int, 
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """
    Elimina un cliente por ID.
    """
    cliente_db = db.query(Cliente).filter(Cliente.id == cliente_id).first()
    if not cliente_db:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")

    db.delete(cliente_db)
    db.commit()
    return {"message": "Cliente eliminado correctamente"}
