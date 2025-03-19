from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime, timedelta

# Importa tus propios schemas, servicios, modelos
from schemas.auth_schemas import LoginSchema, LoginResponse
from services.auth_service import authenticate_user, create_access_token, get_password_hash
from services.audit_service import log_event
from database import get_db

# Modelos
from models.usuarios import Usuario, EstadoUsuario
from models.organizaciones import (Organizacion, Sucursal, Bodega,
                                   CentroCosto, Caja, EstadoOrganizacion)
from models.roles import Rol

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/login", response_model=LoginResponse)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: AsyncSession = Depends(get_db),
):
    """
    Login usando la password flow. 
    'form_data.username' = email, 'form_data.password' = password
    """
    # Invocas tu servicio asíncrono
    user = await authenticate_user(db, form_data.username, form_data.password)
    if not user:
        # Registras evento de login fallido
        await log_event(db, None, "LOGIN_FAIL", f"Intento fallido con email={form_data.username}")
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,
                            detail="Credenciales inválidas")

    # Generas el token
    token = create_access_token({
        "sub": str(user.id),
        "org": str(user.organizacion_id),
        "rol": str(user.rol_id),
    })

    # Registras evento de login exitoso
    await log_event(db, user.id, "LOGIN_OK", f"Usuario {user.email} inició sesión")

    return {"access_token": token, "token_type": "bearer"}


@router.post("/register")
async def register_user_auto(
    nombre: str,
    email: str,
    password: str,
    auto_org: bool = True,  # si deseas un query param
    db: AsyncSession = Depends(get_db)
):
    """
    Crea un usuario y, opcionalmente, también una organización y
    entidades relacionadas (sucursal principal, bodega principal, etc.).
    """
    # 1) Verificar si el email ya existe
    from sqlalchemy import select
    stmt = select(Usuario).where(Usuario.email == email)
    result = await db.execute(stmt)
    existing = result.scalars().first()

    if existing:
        raise HTTPException(status_code=400, detail="Email ya registrado")

    # 2) Obtener (o crear) rol admin
    stmt_rol = select(Rol).where(Rol.nombre == "Admin")
    rol_result = await db.execute(stmt_rol)
    rol_admin = rol_result.scalars().first()
    if not rol_admin:
        rol_admin = Rol(nombre="Admin", descripcion="Administrador")
        db.add(rol_admin)
        await db.commit()
        await db.refresh(rol_admin)

    # 3) Crear el usuario
    hashed = get_password_hash(password)
    nuevo_user = Usuario(
        nombre=nombre,
        email=email,
        hashed_password=hashed,
        rol_id=rol_admin.id,
        estado=EstadoUsuario.activo
    )
    db.add(nuevo_user)
    await db.commit()
    await db.refresh(nuevo_user)

    # 4) Crear org si auto_org=True
    if auto_org:
        org = Organizacion(
            nombre_fiscal="Organizacion de " + nombre.upper(),
            estado=EstadoOrganizacion.activo,
            email_principal=email,
            fecha_inicio_plan=datetime.utcnow(),
            fecha_fin_plan=datetime.utcnow() + timedelta(days=15),
            trial_activo=True
        )
        db.add(org)
        await db.commit()
        await db.refresh(org)

        # Asignar la org al usuario
        nuevo_user.organizacion_id = org.id
        await db.commit()

        # Sucursal principal
        suc_principal = Sucursal(
            organizacion_id=org.id,
            nombre="Principal",
            pais="COLOMBIA",
            sucursal_principal=True,
            activa=True
        )
        db.add(suc_principal)
        await db.commit()
        await db.refresh(suc_principal)

        # Bodega principal
        bodega_principal = Bodega(
            organizacion_id=org.id,
            sucursal_id=suc_principal.id,
            nombre="Bodega Principal",
            bodega_por_defecto=True,
            estado=True
        )
        db.add(bodega_principal)

        # Centro de Costos principal
        cc_principal = CentroCosto(
            organizacion_id=org.id,
            codigo="CC-PRINC",
            nombre="Centro de Costos Principal",
            nivel="PRINCIPAL",
            estado=True
        )
        db.add(cc_principal)

        # Caja principal
        caja = Caja(
            organizacion_id=org.id,
            sucursal_id=suc_principal.id,
            nombre="Caja Principal",
            estado=True,
            vigencia=True
        )
        db.add(caja)

        await db.commit()
        # Podrías refrescar si requieres usar sus IDs, etc.

    # Registrar un evento
    await log_event(db, nuevo_user.id, "USER_CREATED",
                    f"Usuario {nuevo_user.email} creado con org={nuevo_user.organizacion_id}")

    return {
        "message": "Usuario y organización creados con éxito",
        "user_id": nuevo_user.id,
        "org_id": nuevo_user.organizacion_id
    }
