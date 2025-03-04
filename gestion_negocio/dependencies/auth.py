from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
import jwt
from sqlalchemy.orm import Session
from database import get_db
from models.usuarios import Usuario
from services.auth_service import JWT_SECRET, JWT_ALGORITHM

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

# Constantes de rol
ROLE_SUPERADMIN = 1
ROLE_ADMIN = 2
ROLE_EMPLEADO = 3

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Token inválido")
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expirado")
    except Exception:
        raise HTTPException(status_code=401, detail="Token inválido")
    
    user = db.query(Usuario).filter(Usuario.id == user_id).first()
    if not user:
        raise HTTPException(status_code=401, detail="Usuario no encontrado")
    return user

def role_required(allowed_roles: list[int]):
    """
    Dependencia que chequea si el rol_id del usuario actual 
    está dentro de 'allowed_roles'.
    """
    def wrapper(user=Depends(get_current_user)):
        if user.rol_id not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No tienes permiso para realizar esta operación."
            )
        return user
    return wrapper

def role_required_at_most(role_max: int):
    """
    Permite acceso a cualquier user.rol_id <= role_max
    (1=superadmin < 2=admin < 3=empleado)
    """
    def wrapper(user=Depends(get_current_user)):
        if user.rol_id > role_max:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No tienes permiso para realizar esta operación."
            )
        return user
    return wrapper