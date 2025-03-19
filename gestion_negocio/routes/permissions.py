# gestion_negocio/routes/permissions.py

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import or_, select, func
from sqlalchemy.ext.asyncio import AsyncSession
from database import get_db
from models.permissions import Permission
from schemas.permission_schemas import (
    PermissionCreate,
    PermissionRead,
    PaginatedPermissions
)
# from dependencies.auth import get_current_user  # si lo requieres

router = APIRouter(prefix="/permissions", tags=["Permissions"])
# si requieres auth: dependencies=[Depends(get_current_user)]


@router.get("/", response_model=PaginatedPermissions)
async def list_permissions(
    db: AsyncSession = Depends(get_db),
    search: str = Query("", alias="search"),
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, alias="page_size")
):
    """
    Retorna permisos paginados y con búsqueda opcional.
    GET /permissions?search=&page=1&page_size=10
    Responde { data, page, total_paginas, total_registros }
    """

    stmt_base = select(Permission)

    # Búsqueda en campo 'nombre' o 'descripcion'
    if search:
        search_like = f"%{search}%"
        stmt_base = stmt_base.where(
            or_(
                Permission.nombre.ilike(search_like),
                Permission.descripcion.ilike(search_like)
            )
        )

    # Contar total registros
    count_stmt = stmt_base.with_only_columns(func.count(Permission.id))
    total_result = await db.execute(count_stmt)
    total_registros = total_result.scalar() or 0

    total_paginas = max((total_registros + page_size - 1) // page_size, 1)
    if page > total_paginas:
        page = total_paginas

    offset = (page - 1) * page_size

    stmt_paginado = stmt_base.offset(offset).limit(page_size)
    result_perms = await db.execute(stmt_paginado)
    perms_db = result_perms.scalars().all()

    return {
        "data": perms_db,
        "page": page,
        "total_paginas": total_paginas,
        "total_registros": total_registros
    }


@router.post("/", response_model=PermissionRead)
async def create_permission(
    perm_data: PermissionCreate,
    db: AsyncSession = Depends(get_db),
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
    # Validar duplicado
    stmt_exist = select(Permission).where(Permission.nombre == perm_data.nombre)
    result_exist = await db.execute(stmt_exist)
    existing = result_exist.scalars().first()
    if existing:
        raise HTTPException(status_code=400, detail="El nombre de permiso ya existe.")

    perm = Permission(
        nombre=perm_data.nombre,
        descripcion=perm_data.descripcion
    )
    db.add(perm)
    await db.commit()
    await db.refresh(perm)
    return perm


@router.get("/{perm_id}", response_model=PermissionRead)
async def get_permission(
    perm_id: int,
    db: AsyncSession = Depends(get_db),
    # current_user = Depends(get_current_user)
):
    """
    Retorna un permiso por ID.
    """
    stmt = select(Permission).where(Permission.id == perm_id)
    result = await db.execute(stmt)
    perm = result.scalars().first()
    if not perm:
        raise HTTPException(status_code=404, detail="Permiso no encontrado.")
    return perm


@router.put("/{perm_id}", response_model=PermissionRead)
async def update_permission(
    perm_id: int,
    perm_data: PermissionCreate,  # reutilizamos PermissionCreate
    db: AsyncSession = Depends(get_db),
    # current_user = Depends(get_current_user)
):
    """
    Actualiza un permiso (nombre, descripcion).
    PUT /permissions/{perm_id}
    body => { "nombre": "...", "descripcion": "..." }
    """
    stmt = select(Permission).where(Permission.id == perm_id)
    result = await db.execute(stmt)
    perm = result.scalars().first()
    if not perm:
        raise HTTPException(status_code=404, detail="Permiso no encontrado.")

    # Validar que no se duplique 'nombre'
    if perm.nombre != perm_data.nombre:
        stmt_dup = select(Permission).where(Permission.nombre == perm_data.nombre)
        dup_result = await db.execute(stmt_dup)
        existing = dup_result.scalars().first()
        if existing:
            raise HTTPException(status_code=400, detail="El nombre de permiso ya existe.")

    perm.nombre = perm_data.nombre
    perm.descripcion = perm_data.descripcion
    await db.commit()
    await db.refresh(perm)
    return perm


@router.delete("/{perm_id}")
async def delete_permission(
    perm_id: int,
    db: AsyncSession = Depends(get_db),
    # current_user = Depends(get_current_user)
):
    """
    Elimina un permiso por ID.
    Retorna { "message": "..." }
    """
    stmt = select(Permission).where(Permission.id == perm_id)
    result = await db.execute(stmt)
    perm = result.scalars().first()
    if not perm:
        raise HTTPException(status_code=404, detail="Permiso no encontrado.")

    await db.delete(perm)
    await db.commit()
    return {"message": f"Permiso {perm.nombre} eliminado con éxito."}
