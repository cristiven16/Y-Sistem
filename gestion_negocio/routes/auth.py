from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordRequestForm
# O bien usar tu propio schema de Login
from schemas.auth_schemas import LoginSchema, LoginResponse
from services.auth_service import authenticate_user, create_access_token, get_password_hash
from services.audit_service import log_event
from database import get_db
from models.usuarios import Usuario

router = APIRouter(prefix="/auth", tags=["Auth"])

@router.post("/login", response_model=LoginResponse)
def login(payload: LoginSchema, db: Session = Depends(get_db)):
    user = authenticate_user(db, payload.email, payload.password)
    if not user:
        log_event(db, None, "LOGIN_FAIL", f"Intento fallido con email={payload.email}")
        raise HTTPException(status_code=401, detail="Credenciales inválidas")

    # (Si tuviera MFA, aquí validaríamos el TOTP)
    token = create_access_token({"sub": str(user.id), "org": str(user.organizacion_id), "rol": str(user.rol_id)})
    log_event(db, user.id, "LOGIN_OK", f"Usuario {user.email} inició sesión")

    return {"access_token": token, "token_type": "bearer"}

@router.post("/register")
def register_user(
    nombre: str,
    email: str,
    password: str,
    db: Session = Depends(get_db)
):
    # Verificar email duplicado
    existing = db.query(Usuario).filter(Usuario.email == email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email ya registrado")

    hashed = get_password_hash(password)
    nuevo = Usuario(nombre=nombre, email=email, hashed_password=hashed)
    db.add(nuevo)
    db.commit()
    db.refresh(nuevo)

    log_event(db, nuevo.id, "USER_CREATED", f"Usuario {nuevo.email} creado")
    return {"message": "Usuario creado exitosamente", "user_id": nuevo.id}
