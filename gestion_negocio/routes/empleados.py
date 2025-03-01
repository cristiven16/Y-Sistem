# gestion_negocio/routes/empleados.py

from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func
from database import get_db
from models.empleados import Empleado
from schemas.empleados import (
    EmpleadoCreateUpdateSchema,
    EmpleadoPatchSchema,         # <-- El nuevo esquema de actualización parcial
    EmpleadoResponseSchema,
    PaginatedEmpleados
)
from dependencies.auth import get_current_user
from services.dv_calculator import calc_dv_if_nit


router = APIRouter(prefix="/empleados", tags=["Empleados"], dependencies=[Depends(get_current_user)])

def normalize_text(text: str) -> str:
    return (text.replace("á", "a")
                .replace("é", "e")
                .replace("í", "i")
                .replace("ó", "o")
                .replace("ú", "u"))

@router.post("/", response_model=dict)
def crear_empleado(empleado_in: EmpleadoCreateUpdateSchema, db: Session = Depends(get_db)):
    """
    Crea un empleado con todos los campos obligatorios que define EmpleadoCreateUpdateSchema.
    """
    # 1) Verificar si (org_id, numero_documento) ya existe
    duplicado = db.query(Empleado).filter(
        Empleado.organizacion_id == empleado_in.organizacion_id,
        Empleado.numero_documento == empleado_in.numero_documento
    ).first()
    if duplicado:
        raise HTTPException(
            status_code=400, 
            detail="Documento duplicado en la misma organización."
        )

    # 2) Normalizar + mayúsculas
    empleado_in.nombre_razon_social = empleado_in.nombre_razon_social.upper()
    empleado_in.numero_documento = normalize_text(empleado_in.numero_documento).strip()

    # 3) Si deseas recalcular DV
    dv_calc = calc_dv_if_nit(empleado_in.tipo_documento_id, empleado_in.numero_documento)

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
    """
    Lista paginada de empleados, con filtro por 'search' y 'es_vendedor'.
    """
    query = db.query(Empleado).options(
        joinedload(Empleado.tipo_documento),
        joinedload(Empleado.departamento),
        joinedload(Empleado.ciudad)
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
    """
    Obtiene un empleado por su ID
    """
    emp = db.query(Empleado).filter(Empleado.id == empleado_id).first()
    if not emp:
        raise HTTPException(status_code=404, detail="Empleado no encontrado")
    return emp


@router.put("/{empleado_id}", response_model=EmpleadoResponseSchema)
def actualizar_empleado_completo(
    empleado_id: int,
    emp_in: EmpleadoCreateUpdateSchema,
    db: Session = Depends(get_db)
):
    """
    Actualiza TODOS los campos de un empleado (PUT).
    """
    emp_db = db.query(Empleado).filter(Empleado.id == empleado_id).first()
    if not emp_db:
        raise HTTPException(status_code=404, detail="Empleado no encontrado")

    # Validar duplicado de documento
    if emp_in.numero_documento != emp_db.numero_documento:
        duplicado = db.query(Empleado).filter(
            Empleado.organizacion_id == emp_in.organizacion_id,
            Empleado.numero_documento == emp_in.numero_documento,
            Empleado.id != empleado_id
        ).first()
        if duplicado:
            raise HTTPException(status_code=400, detail="Documento duplicado en la misma organización.")

    # Normalizar + DV
    emp_in.nombre_razon_social = emp_in.nombre_razon_social.upper()
    emp_in.numero_documento = normalize_text(emp_in.numero_documento).strip()
    dv_calc = calc_dv_if_nit(emp_in.tipo_documento_id, emp_in.numero_documento)

    # Asignar
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

    db.commit()
    db.refresh(emp_db)
    return emp_db


@router.patch("/{empleado_id}", response_model=EmpleadoResponseSchema)
def actualizar_empleado_parcial(
    empleado_id: int,
    emp_patch: EmpleadoPatchSchema,
    db: Session = Depends(get_db)
):
    """
    Actualiza SOLO los campos que vengan en el JSON (partial update).
    """
    emp_db = db.query(Empleado).filter(Empleado.id == empleado_id).first()
    if not emp_db:
        raise HTTPException(status_code=404, detail="Empleado no encontrado")

    campos = emp_patch.dict(exclude_unset=True)

    # Validar si cambia numero_documento => duplicado en la misma org
    if "numero_documento" in campos:
        numero_nuevo = normalize_text(campos["numero_documento"]).strip()
        if numero_nuevo != emp_db.numero_documento:
            org_id = campos.get("organizacion_id", emp_db.organizacion_id)
            duplicado = db.query(Empleado).filter(
                Empleado.organizacion_id == org_id,
                Empleado.numero_documento == numero_nuevo,
                Empleado.id != emp_db.id
            ).first()
            if duplicado:
                raise HTTPException(status_code=400, detail="Documento duplicado en la misma organización.")
            campos["numero_documento"] = numero_nuevo

    # Si cambia nombre_razon_social => mayúsculas
    if "nombre_razon_social" in campos and campos["nombre_razon_social"]:
        campos["nombre_razon_social"] = campos["nombre_razon_social"].upper()

    # Recalcular DV si cambia tipo_documento_id o numero_documento
    if "tipo_documento_id" in campos or "numero_documento" in campos:
        tdoc = campos.get("tipo_documento_id", emp_db.tipo_documento_id)
        ndoc = campos.get("numero_documento", emp_db.numero_documento)
        dv_calc = calc_dv_if_nit(tdoc, ndoc)
        if dv_calc:
            emp_db.dv = dv_calc

    # Asignar
    for key, value in campos.items():
        setattr(emp_db, key, value)

    db.commit()
    db.refresh(emp_db)
    return emp_db


@router.delete("/{empleado_id}")
def eliminar_empleado(
    empleado_id: int, 
    db: Session = Depends(get_db)
):
    emp_db = db.query(Empleado).filter(Empleado.id == empleado_id).first()
    if not emp_db:
        raise HTTPException(status_code=404, detail="Empleado no encontrado")
    db.delete(emp_db)
    db.commit()
    return {"message": "Empleado eliminado correctamente"}
