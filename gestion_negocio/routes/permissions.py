# routes/permissions.py

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_
from database import get_db
from models.permissions import Permission
from schemas.permission_schemas import (
    PermissionCreate,
    PermissionRead,
    PaginatedPermissions
)
# from dependencies.auth import get_current_user

router = APIRouter(prefix="/permissions", tags=["Permissions"])


@router.get("/", response_model=PaginatedPermissions)
def list_permissions(
    db: Session = Depends(get_db),
    search: str = Query("", alias="search"),
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, alias="page_size")
):
    """
    Retorna permisos paginados y con búsqueda opcional.
    GET /permissions?search=&page=1&page_size=10
    Responde { data, page, total_paginas, total_registros }
    """
    query = db.query(Permission)

    # Búsqueda en campo 'nombre' o 'descripcion'
    if search:
        search_like = f"%{search}%"
        query = query.filter(
            or_(
                Permission.nombre.ilike(search_like),
                Permission.descripcion.ilike(search_like)
            )
        )

    total_registros = query.count()
    total_paginas = max((total_registros + page_size - 1) // page_size, 1)
    if page > total_paginas:
        page = total_paginas

    offset = (page - 1) * page_size
    perms_db = query.offset(offset).limit(page_size).all()

    return {
      "data": perms_db,
      "page": page,
      "total_paginas": total_paginas,
      "total_registros": total_registros
    }


@router.post("/", response_model=PermissionRead)
def create_permission(
    perm_data: PermissionCreate,
    db: Session = Depends(get_db),
    # current_user = Depends(get_current_user)
):
    """
    Crea un nuevo permiso.
    Ejemplo de body:
    {
      "nombre": "create_users",
      "descripcion": "Puede crear usuarios"
    }
    """
    existing = db.query(Permission).filter(
        Permission.nombre == perm_data.nombre
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="El nombre de permiso ya existe.")

    perm = Permission(
        nombre=perm_data.nombre,
        descripcion=perm_data.descripcion
    )
    db.add(perm)
    db.commit()
    db.refresh(perm)
    return perm


@router.get("/{perm_id}", response_model=PermissionRead)
def get_permission(
    perm_id: int,
    db: Session = Depends(get_db),
    # current_user = Depends(get_current_user)
):
    """
    Retorna un permiso por ID.
    """
    perm = db.query(Permission).filter(Permission.id == perm_id).first()
    if not perm:
        raise HTTPException(status_code=404, detail="Permiso no encontrado.")
    return perm


@router.put("/{perm_id}", response_model=PermissionRead)
def update_permission(
    perm_id: int,
    perm_data: PermissionCreate,  # reutilizamos PermissionCreate (o defines uno Partial)
    db: Session = Depends(get_db),
    # current_user = Depends(get_current_user)
):
    """
    Actualiza un permiso (nombre, descripcion).
    PUT /permissions/{perm_id}
    body => { "nombre": "...", "descripcion": "..." }
    """
    perm = db.query(Permission).filter(Permission.id == perm_id).first()
    if not perm:
        raise HTTPException(status_code=404, detail="Permiso no encontrado.")

    # Validar que no se duplique 'nombre' con otro registro
    if perm.nombre != perm_data.nombre:
        existing = db.query(Permission).filter(
            Permission.nombre == perm_data.nombre
        ).first()
        if existing:
            raise HTTPException(status_code=400, detail="El nombre de permiso ya existe.")

    perm.nombre = perm_data.nombre
    perm.descripcion = perm_data.descripcion
    db.commit()
    db.refresh(perm)
    return perm


@router.delete("/{perm_id}")
def delete_permission(
    perm_id: int,
    db: Session = Depends(get_db),
    # current_user = Depends(get_current_user)
):
    """
    Elimina un permiso por ID. 
    Retorna { "message": "..." }
    """
    perm = db.query(Permission).filter(Permission.id == perm_id).first()
    if not perm:
        raise HTTPException(status_code=404, detail="Permiso no encontrado.")

    db.delete(perm)
    db.commit()
    return {"message": f"Permiso {perm.nombre} eliminado con éxito."}
