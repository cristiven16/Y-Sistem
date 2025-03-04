from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from schemas.user_schemas import UserCreate, UserUpdate, UserRead
from services.auth_service import get_password_hash
from services.audit_service import log_event
from models.usuarios import Usuario, EstadoUsuario
from models.roles import Rol
from models.organizaciones import Organizacion
from dependencies.auth import get_current_user

router = APIRouter(prefix="/users", tags=["Users"], dependencies=[Depends(get_current_user)])


@router.post("/", response_model=UserRead)
def create_user(
    user_data: UserCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Crea un nuevo usuario (campos completos).
    Valida email duplicado, rol_id y organizacion_id.
    """
    # 1) Validar email duplicado
    existing = db.query(Usuario).filter(Usuario.email == user_data.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="El email ya existe")

    # 2) Validar rol_id
    if user_data.rol_id is not None:
        rol = db.query(Rol).filter(Rol.id == user_data.rol_id).first()
        if not rol:
            raise HTTPException(status_code=400, detail="El rol especificado no existe")

    # 3) Validar organizacion_id
    if user_data.organizacion_id is not None:
        org = db.query(Organizacion).filter(Organizacion.id == user_data.organizacion_id).first()
        if not org:
            raise HTTPException(status_code=400, detail="La organización especificada no existe")

    # 4) Hashear la contraseña
    hashed_pass = get_password_hash(user_data.password)

    # 5) Crear la instancia
    nuevo_usuario = Usuario(
        nombre=user_data.nombre,
        email=user_data.email,
        hashed_password=hashed_pass,
        rol_id=user_data.rol_id,
        organizacion_id=user_data.organizacion_id,
        estado=EstadoUsuario.activo  # por defecto
    )
    db.add(nuevo_usuario)
    db.commit()
    db.refresh(nuevo_usuario)

    # 6) Log
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
    current_user = Depends(get_current_user)
):
    """
    Obtiene un usuario por ID.
    """
    usuario = db.query(Usuario).filter(Usuario.id == user_id).first()
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return usuario


@router.patch("/{user_id}", response_model=UserRead)
def update_user_partial(
    user_id: int,
    user_data: UserUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Actualiza un usuario de manera parcial.
    Solo los campos enviados en el JSON se modifican.
    """
    usuario = db.query(Usuario).filter(Usuario.id == user_id).first()
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    fields = user_data.dict(exclude_unset=True)

    # Validar si cambia el email
    if "email" in fields and fields["email"] != usuario.email:
        existing = db.query(Usuario).filter(Usuario.email == fields["email"]).first()
        if existing:
            raise HTTPException(status_code=400, detail="El nuevo email ya está registrado")

    # Validar rol_id
    if "rol_id" in fields and fields["rol_id"] is not None:
        rol = db.query(Rol).filter(Rol.id == fields["rol_id"]).first()
        if not rol:
            raise HTTPException(status_code=400, detail="El rol especificado no existe")

    # Validar organizacion_id
    if "organizacion_id" in fields and fields["organizacion_id"] is not None:
        org = db.query(Organizacion).filter(Organizacion.id == fields["organizacion_id"]).first()
        if not org:
            raise HTTPException(status_code=400, detail="La organización especificada no existe")

    # Asignar solo lo que venga
    if "nombre" in fields:
        usuario.nombre = fields["nombre"]
    if "email" in fields:
        usuario.email = fields["email"]
    if "password" in fields:
        usuario.hashed_password = get_password_hash(fields["password"])
    if "rol_id" in fields:
        usuario.rol_id = fields["rol_id"]
    if "organizacion_id" in fields:
        usuario.organizacion_id = fields["organizacion_id"]
    if "estado" in fields:
        usuario.estado = fields["estado"]

    db.commit()
    db.refresh(usuario)

    log_event(db, current_user.id, "USER_UPDATED", f"Usuario {usuario.email} actualizado parcialmente")
    return usuario


@router.delete("/{user_id}")
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Elimina un usuario por ID.
    """
    usuario = db.query(Usuario).filter(Usuario.id == user_id).first()
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    db.delete(usuario)
    db.commit()

    log_event(db, current_user.id, "USER_DELETED", f"Usuario {user_id} eliminado")
    return {"message": f"Usuario {user_id} eliminado con éxito"}




    