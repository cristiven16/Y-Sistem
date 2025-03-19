# gestion_negocio/dependencies/auth.py

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
import jwt
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from database import get_db
from models.usuarios import Usuario
from services.auth_service import JWT_SECRET, JWT_ALGORITHM

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

# Constantes de rol
ROLE_SUPERADMIN = 1
ROLE_ADMIN = 2
ROLE_EMPLEADO = 3


async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db),
):
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id_str = payload.get("sub")  # Este viene como string
        if not user_id_str:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token inválido"
            )
        # Convertir el user_id de string a entero
        user_id = int(user_id_str)
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token expirado"
        )
    except (ValueError, TypeError):
        # ValueError si int(user_id_str) falla (no es un número)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido"
        )
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido"
        )

    # Consulta asíncrona usando select + AsyncSession
    stmt = select(Usuario).where(Usuario.id == user_id)
    result = await db.execute(stmt)
    user = result.scalars().first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuario no encontrado"
        )
    return user


def role_required(allowed_roles: list[int]):
    """
    Dependencia que chequea si el rol_id del usuario actual
    está dentro de 'allowed_roles'.
    """
    async def wrapper(user: Usuario = Depends(get_current_user)):
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
    async def wrapper(user: Usuario = Depends(get_current_user)):
        if user.rol_id > role_max:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No tienes permiso para realizar esta operación."
            )
        return user
    return wrapper
