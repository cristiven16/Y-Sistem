from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func
from database import get_db
from models.empleados import Empleado
from schemas.empleados import (
    EmpleadoCreateUpdateSchema,
    EmpleadoResponseSchema,
    PaginatedEmpleados
)

router = APIRouter(prefix="/empleados", tags=["Empleados"])

def normalize_text(text: str) -> str:
    return (text.replace("á", "a")
                .replace("é", "e")
                .replace("í", "i")
                .replace("ó", "o")
                .replace("ú", "u"))

@router.post("/", response_model=dict)
def crear_empleado(empleado_in: EmpleadoCreateUpdateSchema, db: Session = Depends(get_db)):
    # Validar duplicado
    duplicado = db.query(Empleado).filter(
        Empleado.numero_documento == empleado_in.numero_documento
    ).first()
    if duplicado:
        raise HTTPException(status_code=400, detail="Documento duplicado en otro empleado.")

    # Convertir subobjetos
    tipo_documento_id = empleado_in.tipo_documento.id if empleado_in.tipo_documento else None
    departamento_id = empleado_in.departamento.id if empleado_in.departamento else None
    ciudad_id = empleado_in.ciudad.id if empleado_in.ciudad else None

    nuevo = Empleado(
        tipo_documento_id=tipo_documento_id,
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
        departamento_id=departamento_id,
        ciudad_id=ciudad_id,
        direccion=empleado_in.direccion,
        sucursal_id=empleado_in.sucursal_id,
        observacion=empleado_in.observacion,
        cargo=empleado_in.cargo,
        fecha_nacimiento=empleado_in.fecha_nacimiento,
        fecha_ingreso=empleado_in.fecha_ingreso,
        activo=empleado_in.activo,
        es_vendedor=empleado_in.es_vendedor,
    )
    db.add(nuevo)
    db.commit()
    db.refresh(nuevo)

    return {
        "message": "Empleado creado con éxito",
        "id": nuevo.id,
        "numero_documento": nuevo.numero_documento
    }

@router.get("/", response_model=PaginatedEmpleados)
def obtener_empleados(
    db: Session = Depends(get_db),
    search: Optional[str] = None,
    es_vendedor: Optional[bool] = None,
    page: int = 1,
    page_size: int = 10
):
    query = db.query(Empleado).options(
        joinedload(Empleado.tipo_documento),
        joinedload(Empleado.departamento),
        joinedload(Empleado.ciudad),
    )
    if es_vendedor is not None:
        query = query.filter(Empleado.es_vendedor == es_vendedor)

    if search:
        normalized = normalize_text(search).lower().strip()
        terms = normalized.split()
        for term in terms:
            query = query.filter(
                func.lower(Empleado.nombre_razon_social).ilike(f"%{term}%")
            )

    total_registros = query.count()
    total_paginas = max((total_registros + page_size - 1)//page_size, 1)
    if page > total_paginas:
        page = total_paginas
    offset = (page - 1)*page_size

    empleados_db = query.offset(offset).limit(page_size).all()
    data = [EmpleadoResponseSchema.from_orm(e) for e in empleados_db]

    return {
        "data": data,
        "page": page,
        "total_paginas": total_paginas,
        "total_registros": total_registros
    }

@router.get("/{empleado_id}", response_model=EmpleadoResponseSchema)
def obtener_empleado(empleado_id: int, db: Session = Depends(get_db)):
    emp = db.query(Empleado).filter(Empleado.id == empleado_id).first()
    if not emp:
        raise HTTPException(status_code=404, detail="Empleado no encontrado")
    return EmpleadoResponseSchema.from_orm(emp)

@router.put("/{empleado_id}", response_model=EmpleadoResponseSchema)
def actualizar_empleado(empleado_id: int, emp_in: EmpleadoCreateUpdateSchema, db: Session = Depends(get_db)):
    emp_db = db.query(Empleado).filter(Empleado.id == empleado_id).first()
    if not emp_db:
        raise HTTPException(status_code=404, detail="Empleado no encontrado")

    # Validar duplicado si cambió doc
    if emp_in.numero_documento != emp_db.numero_documento:
        duplicado = db.query(Empleado).filter(
            Empleado.numero_documento == emp_in.numero_documento,
            Empleado.id != empleado_id
        ).first()
        if duplicado:
            raise HTTPException(status_code=400, detail="Documento duplicado en otro empleado.")

    # Sub-objetos
    tipo_documento_id = emp_in.tipo_documento.id if emp_in.tipo_documento else None
    departamento_id = emp_in.departamento.id if emp_in.departamento else None
    ciudad_id = emp_in.ciudad.id if emp_in.ciudad else None

    data_dict = emp_in.dict(exclude_unset=True)
    data_dict.pop("tipo_documento", None)
    data_dict.pop("departamento", None)
    data_dict.pop("ciudad", None)

    if tipo_documento_id is not None:
        emp_db.tipo_documento_id = tipo_documento_id
    if departamento_id is not None:
        emp_db.departamento_id = departamento_id
    if ciudad_id is not None:
        emp_db.ciudad_id = ciudad_id

    for key, value in data_dict.items():
        setattr(emp_db, key, value)

    db.commit()
    db.refresh(emp_db)
    return EmpleadoResponseSchema.from_orm(emp_db)

@router.delete("/{empleado_id}")
def eliminar_empleado(empleado_id: int, db: Session = Depends(get_db)):
    emp_db = db.query(Empleado).filter(Empleado.id == empleado_id).first()
    if not emp_db:
        raise HTTPException(status_code=404, detail="Empleado no encontrado")
    db.delete(emp_db)
    db.commit()
    return {"message": "Empleado eliminado correctamente"}
