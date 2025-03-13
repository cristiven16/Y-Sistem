from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload
from typing import Optional
from sqlalchemy import or_

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

# Con este prefix, tus endpoints inician con /users
router = APIRouter(prefix="/users", tags=["Users"], dependencies=[Depends(get_current_user)])


@router.post("/", response_model=UserRead)
def create_user(
    user_data: UserCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """
    Crea un nuevo usuario (campos completos).
    Reglas:
      - superadmin => sin restricciones
      - admin => no puede crear usuario con rol "superadmin"
      - empleado => no puede crear usuarios
    Valida email duplicado, rol_id y organizacion_id.
    """
    # 1) Reglas de acceso
    if current_user.tipo_usuario == TipoUsuario.empleado:
        raise HTTPException(403, "Un empleado no puede crear usuarios.")

    # Validar si admin => no asignar rol 'superadmin'
    if current_user.tipo_usuario == TipoUsuario.admin and user_data.rol_id:
        rol_obj = db.query(Rol).filter(Rol.id == user_data.rol_id).first()
        if rol_obj and rol_obj.nombre.lower() == "superadmin":
            raise HTTPException(403, "Un admin no puede asignar rol 'superadmin' a otro usuario.")

    # 2) Validar email duplicado
    existing = db.query(Usuario).filter(Usuario.email == user_data.email).first()
    if existing:
        raise HTTPException(400, "El email ya existe")

    # 3) Validar rol_id
    if user_data.rol_id is not None:
        rol_obj = db.query(Rol).filter(Rol.id == user_data.rol_id).first()
        if not rol_obj:
            raise HTTPException(400, "El rol especificado no existe")

    # 4) Validar organizacion_id
    if user_data.organizacion_id is not None:
        org = db.query(Organizacion).filter(Organizacion.id == user_data.organizacion_id).first()
        if not org:
            raise HTTPException(400, "La organización especificada no existe")

        # admin no puede crear usuario en otra org
        if current_user.tipo_usuario == TipoUsuario.admin:
            if org.id != current_user.organizacion_id:
                raise HTTPException(403, "Un admin no puede crear usuarios en otra organización.")

    # 5) Hashear la contraseña
    hashed_pass = get_password_hash(user_data.password)

    # 6) Crear la instancia
    nuevo_usuario = Usuario(
        nombre=user_data.nombre,
        email=user_data.email,
        hashed_password=hashed_pass,
        rol_id=user_data.rol_id,
        organizacion_id=user_data.organizacion_id,
        estado=EstadoUsuario.activo
    )
    db.add(nuevo_usuario)
    db.commit()
    db.refresh(nuevo_usuario)

    # 7) Log
    log_event(db, current_user.id, "USER_CREATED", f"Creación de usuario {nuevo_usuario.email}")
    return nuevo_usuario


@router.get("/me", response_model=UserRead)
def get_me(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """
    Retorna los datos del usuario logueado (extraídos del token).
    """
    return current_user


@router.get("/{user_id}", response_model=UserRead)
def get_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """
    Obtiene un usuario por ID.
    - superadmin => puede ver todos
    - admin => solo usuarios de su organización
    - empleado => no ve (o ajusta tu lógica)
    """
    usuario = db.query(Usuario).filter(Usuario.id == user_id).first()
    if not usuario:
        raise HTTPException(404, "Usuario no encontrado")

    if current_user.tipo_usuario == TipoUsuario.empleado:
        raise HTTPException(403, "Un empleado no puede ver usuarios.")

    if current_user.tipo_usuario == TipoUsuario.admin:
        if usuario.organizacion_id != current_user.organizacion_id:
            raise HTTPException(403, "No puedes ver usuarios de otra organización.")

    return usuario


@router.patch("/{user_id}", response_model=UserRead)
def update_user_partial(
    user_id: int,
    user_data: UserUpdate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """
    Actualiza un usuario de manera parcial.
    Reglas:
      - superadmin => sin restricciones
      - admin => no puede asignar rol 'superadmin', ni cambiar de org
      - empleado => no actualiza
    """
    usuario = db.query(Usuario).filter(Usuario.id == user_id).first()
    if not usuario:
        raise HTTPException(404, "Usuario no encontrado")

    if current_user.tipo_usuario == TipoUsuario.empleado:
        raise HTTPException(403, "Un empleado no puede actualizar usuarios.")

    if current_user.tipo_usuario == TipoUsuario.admin:
        # no puede editar user de otra org
        if usuario.organizacion_id != current_user.organizacion_id:
            raise HTTPException(403, "No puedes editar usuarios de otra organización.")

    fields = user_data.dict(exclude_unset=True)

    # email
    if "email" in fields and fields["email"] != usuario.email:
        existing = db.query(Usuario).filter(Usuario.email == fields["email"]).first()
        if existing:
            raise HTTPException(400, "El nuevo email ya está registrado")
        usuario.email = fields["email"]

    # rol_id => admin no puede asignar superadmin
    if "rol_id" in fields and fields["rol_id"] is not None:
        rol_obj = db.query(Rol).filter(Rol.id == fields["rol_id"]).first()
        if not rol_obj:
            raise HTTPException(400, "El rol especificado no existe")

        if current_user.tipo_usuario == TipoUsuario.admin:
            if rol_obj.nombre.lower() == "superadmin":
                raise HTTPException(403, "Un admin no puede asignar superadmin.")
        usuario.rol_id = fields["rol_id"]

    # organizacion_id => admin no puede reasignar otra org
    if "organizacion_id" in fields and fields["organizacion_id"] is not None:
        org = db.query(Organizacion).filter(Organizacion.id == fields["organizacion_id"]).first()
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

    db.commit()
    db.refresh(usuario)

    log_event(db, current_user.id, "USER_UPDATED", f"Usuario {usuario.email} actualizado")
    return usuario


@router.delete("/{user_id}")
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """
    Elimina un usuario por ID.
    - superadmin => sin restricciones
    - admin => solo su org
    - empleado => no
    """
    usuario = db.query(Usuario).filter(Usuario.id == user_id).first()
    if not usuario:
        raise HTTPException(404, "Usuario no encontrado")

    if current_user.tipo_usuario == TipoUsuario.empleado:
        raise HTTPException(403, "Un empleado no puede eliminar usuarios.")

    if current_user.tipo_usuario == TipoUsuario.admin:
        if usuario.organizacion_id != current_user.organizacion_id:
            raise HTTPException(403, "No puedes eliminar un usuario de otra organización.")

    db.delete(usuario)
    db.commit()

    log_event(db, current_user.id, "USER_DELETED", f"Usuario {user_id} eliminado")
    return {"message": f"Usuario {user_id} eliminado con éxito"}


@router.get("/", response_model=PaginatedUsers)
def list_users(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
    search: Optional[str] = None,
    page: int = 1,
    page_size: int = 10
):
    """
    GET /users
    Lista paginada de usuarios con filtro en "nombre" o "email".
    - superadmin => ve todos
    - admin => filtra por su org
    - empleado => no
    """
    query = db.query(Usuario)

    if current_user.tipo_usuario == TipoUsuario.superadmin:
        pass  # ve todos
    elif current_user.tipo_usuario == TipoUsuario.admin:
        if not current_user.organizacion_id:
            raise HTTPException(403, "No tienes organizacion asignada.")
        query = query.filter(Usuario.organizacion_id == current_user.organizacion_id)
    else:
        # empleado => no
        raise HTTPException(403, "Un empleado no puede listar usuarios.")

    if search:
        search_like = f"%{search}%"
        query = query.filter(or_(Usuario.nombre.ilike(search_like),
                                 Usuario.email.ilike(search_like)))

    total_registros = query.count()
    total_paginas = max((total_registros + page_size - 1)//page_size, 1)
    if page > total_paginas:
        page = total_paginas

    offset = (page - 1)*page_size
    users_db = query.offset(offset).limit(page_size).all()

    data = [UserRead.from_orm(u) for u in users_db]
    return {
        "data": data,
        "page": page,
        "total_paginas": total_paginas,
        "total_registros": total_registros
    }


@router.get("/organizations/{org_id}/users", response_model=PaginatedUsers)
def list_users_by_org(
    org_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
    search: Optional[str] = None,
    page: int = 1,
    page_size: int = 10
):
    """
    GET /users/organizations/{org_id}/users
    Retorna usuarios de la organización {org_id}, con search y paginación.
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
        raise HTTPException(403, "Un empleado no puede listar usuarios de otras org.")

    # Verificar org existe
    org = db.query(Organizacion).filter(Organizacion.id == org_id).first()
    if not org:
        raise HTTPException(404, "Organización no encontrada")

    query = db.query(Usuario).options(joinedload(Usuario.rol)) \
                .filter(Usuario.organizacion_id == org_id)

    if search:
        search_like = f"%{search}%"
        query = query.filter(
            or_(
                Usuario.nombre.ilike(search_like),
                Usuario.email.ilike(search_like)
            )
        )

    total_registros = query.count()
    total_paginas = max((total_registros + page_size - 1)//page_size, 1)
    if page > total_paginas:
        page = total_paginas

    offset = (page - 1)*page_size
    usuarios_db = query.offset(offset).limit(page_size).all()

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
