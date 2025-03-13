# gestion_negocio/routes/roles.py

import math
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_

from database import get_db
from models.roles import Rol
from models.permissions import Permission
from models.usuarios import Usuario, TipoUsuario
from models.organizaciones import Organizacion
from schemas.role_schemas import RoleCreate, RoleRead, PaginatedRoles
from schemas.permission_schemas import PermissionRead
from services.audit_service import log_event
from dependencies.auth import get_current_user

router = APIRouter(prefix="/roles", tags=["Roles"], dependencies=[Depends(get_current_user)])


# ------------------- ROL CRUD -------------------

@router.post("/", response_model=RoleRead)
def create_role(
    role_data: RoleCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """
    Crea un nuevo Rol.
    Lógica de permisos:
      - superadmin => puede crear cualquier rol
      - admin => NO puede crear un rol con nombre "superadmin"
      - empleado => no puede crear roles
    """
    if current_user.tipo_usuario == TipoUsuario.empleado:
        raise HTTPException(status_code=403, detail="Un empleado no puede crear roles.")

    if current_user.tipo_usuario == TipoUsuario.admin:
        if role_data.nombre.lower() == "superadmin":
            raise HTTPException(403, "Un admin no puede crear el rol 'superadmin'.")

    if role_data.organizacion_id is not None:
        org = db.query(Organizacion).filter(Organizacion.id == role_data.organizacion_id).first()
        if not org:
            raise HTTPException(400, "La organización especificada no existe.")

    rol = Rol(
        nombre=role_data.nombre,
        descripcion=role_data.descripcion,
        organizacion_id=role_data.organizacion_id,
        nivel=role_data.nivel  # si usas 'nivel'
    )
    db.add(rol)
    db.commit()
    db.refresh(rol)

    log_event(db, current_user.id, "ROLE_CREATED", f"Rol {rol.nombre} creado (org_id={rol.organizacion_id})")
    return rol


@router.get("/", response_model=PaginatedRoles)
def list_roles(
    search: Optional[str] = Query("", alias="search"),
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1),
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """
    Lista roles con paginación y filtro en 'nombre'.
    - superadmin => ve todos los roles
    - otros => solo ve los de su organizacion
    Devuelve { data, page, total_paginas, total_registros }
    """
    if current_user.tipo_usuario == TipoUsuario.superadmin:
        query = db.query(Rol)
    else:
        # filtrar por organizacion
        if not current_user.organizacion_id:
            raise HTTPException(403, "No tienes organización asignada.")
        query = db.query(Rol).filter(Rol.organizacion_id == current_user.organizacion_id)

    if search:
        query = query.filter(Rol.nombre.ilike(f"%{search}%"))

    total = query.count()
    skip = (page - 1) * page_size
    roles_db = query.offset(skip).limit(page_size).all()

    total_paginas = max((total + page_size - 1) // page_size, 1)
    return PaginatedRoles(
        data=roles_db,
        page=page,
        total_paginas=total_paginas,
        total_registros=total
    )


@router.get("/{role_id}", response_model=RoleRead)
def get_role(
    role_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """
    Retorna un rol por ID, validando que admin/empleado no acceda a rol de otra org.
    """
    rol = db.query(Rol).filter(Rol.id == role_id).first()
    if not rol:
        raise HTTPException(404, "Rol no encontrado.")

    if current_user.tipo_usuario != TipoUsuario.superadmin:
        if rol.organizacion_id != current_user.organizacion_id:
            raise HTTPException(403, "No puedes acceder a un rol de otra organizacion.")

    return rol


@router.put("/{role_id}", response_model=RoleRead)
def update_role(
    role_id: int,
    role_data: RoleCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """
    Actualiza un rol.
    """
    rol = db.query(Rol).filter(Rol.id == role_id).first()
    if not rol:
        raise HTTPException(404, "Rol no encontrado.")

    # Validar acceso
    if current_user.tipo_usuario != TipoUsuario.superadmin:
        if rol.organizacion_id != current_user.organizacion_id:
            raise HTTPException(403, "No puedes editar un rol de otra organización.")

    # Actualizar campos
    fields = role_data.dict(exclude_unset=True)
    if "organizacion_id" in fields and fields["organizacion_id"] is not None:
        org = db.query(Organizacion).filter(Organizacion.id == fields["organizacion_id"]).first()
        if not org:
            raise HTTPException(400, "La organización especificada no existe.")
        rol.organizacion_id = fields["organizacion_id"]

    if "nombre" in fields:
        # Evitar que un admin renombre a 'superadmin'
        if current_user.tipo_usuario == TipoUsuario.admin and fields["nombre"].lower() == "superadmin":
            raise HTTPException(403, "Un admin no puede renombrar un rol a 'superadmin'.")
        rol.nombre = fields["nombre"]

    if "descripcion" in fields:
        rol.descripcion = fields["descripcion"]

    if "nivel" in fields:
        rol.nivel = fields["nivel"]

    db.commit()
    db.refresh(rol)

    log_event(db, current_user.id, "ROLE_UPDATED", f"Rol {rol.id} actualizado")
    return rol


@router.delete("/{role_id}")
def delete_role(
    role_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """
    Elimina un rol por ID.
    """
    rol = db.query(Rol).filter(Rol.id == role_id).first()
    if not rol:
        raise HTTPException(404, "Rol no encontrado.")

    if current_user.tipo_usuario != TipoUsuario.superadmin:
        if rol.organizacion_id != current_user.organizacion_id:
            raise HTTPException(403, "No puedes eliminar un rol de otra organización.")

    db.delete(rol)
    db.commit()

    log_event(db, current_user.id, "ROLE_DELETED", f"Rol {role_id} eliminado")
    return {"message": f"Rol {rol.nombre} (ID {role_id}) eliminado con éxito."}


# ------------------- ASIGNAR / QUITAR PERMISOS -------------------

@router.get("/{role_id}/permissions", response_model=list[PermissionRead])
def get_role_permissions(
    role_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """
    Lista los permisos que tiene un rol.
    """
    rol = db.query(Rol).filter(Rol.id == role_id).first()
    if not rol:
        raise HTTPException(404, "Rol no encontrado.")

    # Valida acceso org
    if current_user.tipo_usuario != TipoUsuario.superadmin:
        if rol.organizacion_id != current_user.organizacion_id:
            raise HTTPException(403, "No tienes acceso a este rol.")

    return rol.permissions


@router.post("/{role_id}/permissions/{perm_id}")
def add_permission_to_role(
    role_id: int,
    perm_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """
    Asigna un permiso (perm_id) a un rol (role_id).
    """
    rol = db.query(Rol).filter(Rol.id == role_id).first()
    if not rol:
        raise HTTPException(404, "Rol no encontrado.")

    # Valida acceso
    if current_user.tipo_usuario != TipoUsuario.superadmin:
        if rol.organizacion_id != current_user.organizacion_id:
            raise HTTPException(403, "No tienes acceso a este rol.")

    perm = db.query(Permission).filter(Permission.id == perm_id).first()
    if not perm:
        raise HTTPException(404, "Permiso no encontrado.")

    if perm in rol.permissions:
        raise HTTPException(400, "El rol ya tiene este permiso asignado.")

    rol.permissions.append(perm)
    db.commit()

    log_event(db, current_user.id, "ROLE_PERMISSION_ADDED",
              f"Se asignó el permiso '{perm.nombre}' al rol '{rol.nombre}'")
    return {"message": f"Permiso '{perm.nombre}' asignado al rol '{rol.nombre}'."}


@router.delete("/{role_id}/permissions/{perm_id}")
def remove_permission_from_role(
    role_id: int,
    perm_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """
    Quita un permiso (perm_id) del rol (role_id).
    """
    rol = db.query(Rol).filter(Rol.id == role_id).first()
    if not rol:
        raise HTTPException(404, "Rol no encontrado.")

    # Valida acceso
    if current_user.tipo_usuario != TipoUsuario.superadmin:
        if rol.organizacion_id != current_user.organizacion_id:
            raise HTTPException(403, "No tienes acceso a este rol.")

    perm = db.query(Permission).filter(Permission.id == perm_id).first()
    if not perm:
        raise HTTPException(404, "Permiso no encontrado.")

    if perm not in rol.permissions:
        raise HTTPException(400, "El rol no tiene este permiso asignado.")

    rol.permissions.remove(perm)
    db.commit()

    log_event(db, current_user.id, "ROLE_PERMISSION_REMOVED",
              f"Se quitó el permiso '{perm.nombre}' del rol '{rol.nombre}'")
    return {"message": f"Permiso '{perm.nombre}' removido del rol '{rol.nombre}'."}
