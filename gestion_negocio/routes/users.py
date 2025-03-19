# gestion_negocio/routes/users.py

from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_, func
from sqlalchemy.orm import joinedload

from database import get_db
from schemas.user_schemas import (
    UserCreate, UserUpdate, UserRead, PaginatedUsers, UserReadExtended
)
from services.auth_service import get_password_hash
from services.audit_service import log_event
from models.usuarios import Usuario, EstadoUsuario, TipoUsuario
from models.roles import Rol
from models.organizaciones import Organizacion
from dependencies.auth import get_current_user


router = APIRouter(prefix="/users", tags=["Users"], dependencies=[Depends(get_current_user)])


@router.post("/", response_model=UserRead)
async def create_user(
    user_data: UserCreate,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """
    Crea un nuevo usuario.
    - superadmin => sin restricciones
    - admin => no puede crear user con rol superadmin
    - empleado => no crea
    """
    if current_user.tipo_usuario == TipoUsuario.empleado:
        raise HTTPException(403, "Un empleado no puede crear usuarios.")

    # Validar si admin => no rol superadmin
    if current_user.tipo_usuario == TipoUsuario.admin and user_data.rol_id:
        stmt_rol = select(Rol).where(Rol.id == user_data.rol_id)
        res_rol = await db.execute(stmt_rol)
        rol_obj = res_rol.scalars().first()
        if rol_obj and rol_obj.nombre.lower() == "superadmin":
            raise HTTPException(403, "Un admin no puede asignar rol 'superadmin'.")

    # Validar email duplicado
    stmt_exist = select(Usuario).where(Usuario.email == user_data.email)
    res_exist = await db.execute(stmt_exist)
    existing = res_exist.scalars().first()
    if existing:
        raise HTTPException(400, "El email ya existe")

    # Validar rol_id
    if user_data.rol_id is not None:
        stmt_rol_check = select(Rol).where(Rol.id == user_data.rol_id)
        res_rol_check = await db.execute(stmt_rol_check)
        rol_obj_check = res_rol_check.scalars().first()
        if not rol_obj_check:
            raise HTTPException(400, "El rol especificado no existe")

    # Validar organizacion_id
    if user_data.organizacion_id is not None:
        stmt_org = select(Organizacion).where(Organizacion.id == user_data.organizacion_id)
        res_org = await db.execute(stmt_org)
        org = res_org.scalars().first()
        if not org:
            raise HTTPException(400, "La organización especificada no existe")

        if current_user.tipo_usuario == TipoUsuario.admin:
            if org.id != current_user.organizacion_id:
                raise HTTPException(403, "Admin no puede crear usuarios en otra organización.")

    hashed_pass = get_password_hash(user_data.password)

    nuevo_usuario = Usuario(
        nombre=user_data.nombre,
        email=user_data.email,
        hashed_password=hashed_pass,
        rol_id=user_data.rol_id,
        organizacion_id=user_data.organizacion_id,
        estado=EstadoUsuario.activo
    )
    db.add(nuevo_usuario)
    await db.commit()
    await db.refresh(nuevo_usuario)

    log_event(db, current_user.id, "USER_CREATED", f"Creación de usuario {nuevo_usuario.email}")
    return nuevo_usuario


@router.get("/me", response_model=UserRead)
async def get_me(
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """
    Retorna datos del usuario logueado (del token).
    """
    return current_user


@router.get("/{user_id}", response_model=UserRead)
async def get_user(
    user_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """
    Obtiene un usuario por ID.
    - superadmin => ve todos
    - admin => solo su org
    - empleado => no
    """
    stmt = select(Usuario).where(Usuario.id == user_id)
    res = await db.execute(stmt)
    usuario = res.scalars().first()
    if not usuario:
        raise HTTPException(404, "Usuario no encontrado")

    if current_user.tipo_usuario == TipoUsuario.empleado:
        raise HTTPException(403, "Un empleado no puede ver usuarios.")

    if current_user.tipo_usuario == TipoUsuario.admin:
        if usuario.organizacion_id != current_user.organizacion_id:
            raise HTTPException(403, "No puedes ver usuarios de otra organización.")

    return usuario


@router.patch("/{user_id}", response_model=UserRead)
async def update_user_partial(
    user_id: int,
    user_data: UserUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """
    Actualiza un usuario de manera parcial.
    - superadmin => sin restricciones
    - admin => no puede asignar superadmin, ni cambiar de org
    - empleado => no
    """
    stmt = select(Usuario).where(Usuario.id == user_id)
    res = await db.execute(stmt)
    usuario = res.scalars().first()
    if not usuario:
        raise HTTPException(404, "Usuario no encontrado")

    if current_user.tipo_usuario == TipoUsuario.empleado:
        raise HTTPException(403, "Un empleado no puede actualizar usuarios.")

    if current_user.tipo_usuario == TipoUsuario.admin:
        if usuario.organizacion_id != current_user.organizacion_id:
            raise HTTPException(403, "No puedes editar usuarios de otra organización.")

    fields = user_data.dict(exclude_unset=True)

    # email
    if "email" in fields and fields["email"] != usuario.email:
        stmt_dup = select(Usuario).where(Usuario.email == fields["email"])
        res_dup = await db.execute(stmt_dup)
        existing_email = res_dup.scalars().first()
        if existing_email:
            raise HTTPException(400, "El nuevo email ya está registrado")
        usuario.email = fields["email"]

    # rol_id => admin no => superadmin
    if "rol_id" in fields and fields["rol_id"] is not None:
        stmt_rol = select(Rol).where(Rol.id == fields["rol_id"])
        res_rol = await db.execute(stmt_rol)
        rol_obj = res_rol.scalars().first()
        if not rol_obj:
            raise HTTPException(400, "El rol especificado no existe")

        if current_user.tipo_usuario == TipoUsuario.admin:
            if rol_obj.nombre.lower() == "superadmin":
                raise HTTPException(403, "Un admin no puede asignar superadmin.")
        usuario.rol_id = fields["rol_id"]

    # organizacion_id => admin no reasigna otra org
    if "organizacion_id" in fields and fields["organizacion_id"] is not None:
        stmt_org = select(Organizacion).where(Organizacion.id == fields["organizacion_id"])
        res_org = await db.execute(stmt_org)
        org = res_org.scalars().first()
        if not org:
            raise HTTPException(400, "La organización especificada no existe")

        if current_user.tipo_usuario == TipoUsuario.admin:
            if org.id != current_user.organizacion_id:
                raise HTTPException(403, "Un admin no puede reasignar a otra org.")
        usuario.organizacion_id = fields["organizacion_id"]

    if "nombre" in fields:
        usuario.nombre = fields["nombre"]
    if "password" in fields:
        usuario.hashed_password = get_password_hash(fields["password"])
    if "estado" in fields:
        usuario.estado = fields["estado"]

    await db.commit()
    await db.refresh(usuario)

    log_event(db, current_user.id, "USER_UPDATED", f"Usuario {usuario.email} actualizado")
    return usuario


@router.delete("/{user_id}")
async def delete_user(
    user_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """
    Elimina un usuario por ID.
    - superadmin => sin restric.
    - admin => solo su org
    - empleado => no
    """
    stmt = select(Usuario).where(Usuario.id == user_id)
    res = await db.execute(stmt)
    usuario = res.scalars().first()
    if not usuario:
        raise HTTPException(404, "Usuario no encontrado")

    if current_user.tipo_usuario == TipoUsuario.empleado:
        raise HTTPException(403, "Un empleado no puede eliminar usuarios.")

    if current_user.tipo_usuario == TipoUsuario.admin:
        if usuario.organizacion_id != current_user.organizacion_id:
            raise HTTPException(403, "No puedes eliminar un usuario de otra organización.")

    await db.delete(usuario)
    await db.commit()

    log_event(db, current_user.id, "USER_DELETED", f"Usuario {user_id} eliminado")
    return {"message": f"Usuario {user_id} eliminado con éxito"}


@router.get("/", response_model=PaginatedUsers)
async def list_users(
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
    search: Optional[str] = None,
    page: int = 1,
    page_size: int = 10
):
    """
    Lista paginada de usuarios con filtro en "nombre" o "email".
    - superadmin => ve todos
    - admin => filtra su org
    - empleado => no
    """
    if current_user.tipo_usuario == TipoUsuario.superadmin:
        stmt_base = select(Usuario)
    elif current_user.tipo_usuario == TipoUsuario.admin:
        if not current_user.organizacion_id:
            raise HTTPException(403, "No tienes organizacion asignada.")
        stmt_base = select(Usuario).where(Usuario.organizacion_id == current_user.organizacion_id)
    else:
        raise HTTPException(403, "Un empleado no puede listar usuarios.")

    if search:
        search_like = f"%{search}%"
        stmt_base = stmt_base.where(
            or_(
                Usuario.nombre.ilike(search_like),
                Usuario.email.ilike(search_like)
            )
        )

    count_stmt = stmt_base.with_only_columns(func.count(Usuario.id))
    res_count = await db.execute(count_stmt)
    total_registros = res_count.scalar() or 0
    total_paginas = max((total_registros + page_size - 1) // page_size, 1)
    if page > total_paginas:
        page = total_paginas
    offset = (page - 1) * page_size

    stmt_paginado = stmt_base.offset(offset).limit(page_size)
    res_users = await db.execute(stmt_paginado)
    users_db = res_users.scalars().all()

    data = [UserRead.from_orm(u) for u in users_db]
    return {
        "data": data,
        "page": page,
        "total_paginas": total_paginas,
        "total_registros": total_registros
    }


@router.get("/organizations/{org_id}/users", response_model=PaginatedUsers)
async def list_users_by_org(
    org_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
    search: Optional[str] = None,
    page: int = 1,
    page_size: int = 10
):
    """
    Retorna usuarios de la organización {org_id}.
    - superadmin => puede listar cualquier org
    - admin => solo su org
    - empleado => no
    """
    if current_user.tipo_usuario == TipoUsuario.superadmin:
        pass
    elif current_user.tipo_usuario == TipoUsuario.admin:
        if org_id != current_user.organizacion_id:
            raise HTTPException(403, "Un admin no puede listar usuarios de otra org.")
    else:
        raise HTTPException(403, "Un empleado no puede listar usuarios.")

    # Verificar org existe
    stmt_org = select(Organizacion).where(Organizacion.id == org_id)
    res_org = await db.execute(stmt_org)
    org = res_org.scalars().first()
    if not org:
        raise HTTPException(404, "Organización no encontrada")

    stmt_base = (
        select(Usuario)
        .options(joinedload(Usuario.rol))
        .where(Usuario.organizacion_id == org_id)
    )

    if search:
        search_like = f"%{search}%"
        stmt_base = stmt_base.where(
            or_(
                Usuario.nombre.ilike(search_like),
                Usuario.email.ilike(search_like)
            )
        )

    count_stmt = stmt_base.with_only_columns(func.count(Usuario.id))
    res_count = await db.execute(count_stmt)
    total_registros = res_count.scalar() or 0
    total_paginas = max((total_registros + page_size - 1)//page_size, 1)
    if page > total_paginas:
        page = total_paginas
    offset = (page - 1)*page_size

    stmt_paginado = stmt_base.offset(offset).limit(page_size)
    res_usuarios = await db.execute(stmt_paginado)
    usuarios_db = res_usuarios.scalars().all()

    data = []
    for u in usuarios_db:
        user_obj = UserReadExtended.from_orm(u)
        if u.rol:
            user_obj.rol_nombre = u.rol.nombre
        data.append(user_obj)

    return {
        "data": data,
        "page": page,
        "total_paginas": total_paginas,
        "total_registros": total_registros
    }
