from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordRequestForm
# O bien usar tu propio schema de Login
from schemas.auth_schemas import LoginSchema, LoginResponse
from services.auth_service import authenticate_user, create_access_token, get_password_hash
from services.audit_service import log_event
from database import get_db
from models.usuarios import Usuario, EstadoUsuario
from models.organizaciones import Organizacion, Sucursal, Bodega, CentroCosto, Caja, EstadoOrganizacion
from models.roles import Rol
from datetime import datetime, timedelta

router = APIRouter(prefix="/auth", tags=["Auth"])

@router.post("/login", response_model=LoginResponse)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    """
    Login usando la password flow.
    Aquí, 'form_data.username' == email 
    """
    # 1) Comparamos username (email) y password
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        log_event(db, None, "LOGIN_FAIL", f"Intento fallido con email={form_data.username}")
        raise HTTPException(status_code=401, detail="Credenciales inválidas")

    # 2) Generamos el access_token
    token = create_access_token({
        "sub": str(user.id),
        "org": str(user.organizacion_id),
        "rol": str(user.rol_id)
    })
    log_event(db, user.id, "LOGIN_OK", f"Usuario {user.email} inició sesión")

    return {"access_token": token, "token_type": "bearer"}

@router.post("/register")
def register_user_auto(
    nombre: str,
    email: str,
    password: str,
    auto_org: bool = True,  # si deseas una query param
    db: Session = Depends(get_db)
):
    # 1) Crear el usuario
    existing = db.query(Usuario).filter(Usuario.email == email).first()
    if existing:
        raise HTTPException(400, "Email ya registrado")

    hashed = get_password_hash(password)
    # Asignar rol Admin
    rol_admin = db.query(Rol).filter(Rol.nombre=="Admin").first()
    if not rol_admin:
        # O crea el rol
        rol_admin = Rol(nombre="Admin", descripcion="Administrador")
        db.add(rol_admin)
        db.commit()
        db.refresh(rol_admin)

    # 2) Crear usuario
    nuevo_user = Usuario(
        nombre=nombre,
        email=email,
        hashed_password=hashed,
        rol_id=rol_admin.id,
        # organizacion_id se asignará luego
        estado=EstadoUsuario.activo,
    )
    db.add(nuevo_user)
    db.commit()
    db.refresh(nuevo_user)

    # 3) Si auto_org => crear organizacion con plan trial
    if auto_org:
        org = Organizacion(
            nombre_fiscal="Organizacion de " + nombre.upper(),
            # si tienes mas campos => fill them
            estado=EstadoOrganizacion.activo,
            email_principal=email,
            # plan_id = plan_lite_id => 15 días
            fecha_inicio_plan=datetime.utcnow(),
            fecha_fin_plan=datetime.utcnow() + timedelta(days=15),
            trial_activo=True
        )
        db.add(org)
        db.commit()
        db.refresh(org)

        # Asignar organizacion al usuario
        nuevo_user.organizacion_id = org.id
        db.commit()

        # 4) Crear Sucursal Principal, Bodega, Centro Costos, Caja
        suc_principal = Sucursal(
            organizacion_id=org.id,
            nombre="Principal",
            pais="COLOMBIA",
            # ...
            sucursal_principal=True,
            activa=True
        )
        db.add(suc_principal)
        db.commit()
        db.refresh(suc_principal)

        # Bodega principal
        bodega_principal = Bodega(
            organizacion_id=org.id,
            sucursal_id=suc_principal.id,
            nombre="Bodega Principal",
            bodega_por_defecto=True,
            estado=True
        )
        db.add(bodega_principal)
        # CentroCostos principal
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
            nombre="Caja Principal",
            sucursal_id=suc_principal.id,
            estado=True,
            vigencia=True
        )
        db.add(caja)
        db.commit()
        # etc. refresh si deseas

    log_event(db, nuevo_user.id, "USER_CREATED", f"Usuario {nuevo_user.email} creado con org={nuevo_user.organizacion_id}")
    return {"message": "Usuario y organización creados con éxito", "user_id": nuevo_user.id, "org_id": nuevo_user.organizacion_id}