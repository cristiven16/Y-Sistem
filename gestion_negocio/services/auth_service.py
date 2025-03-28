import os
import datetime
import jwt
import bcrypt

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from fastapi import HTTPException, status

from models.usuarios import Usuario, EstadoUsuario

JWT_SECRET = os.getenv("JWT_SECRET", "secret_key")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
JWT_EXPIRE_MINUTES = int(os.getenv("JWT_EXPIRE_MINUTES", 60))
print("DEBUG => JWT_EXPIRE_MINUTES:", JWT_EXPIRE_MINUTES)

def get_password_hash(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))

def create_access_token(data: dict, expires_delta: int = JWT_EXPIRE_MINUTES):
    to_encode = data.copy()
    expire = datetime.datetime.utcnow() + datetime.timedelta(minutes=expires_delta)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)
    return encoded_jwt

async def authenticate_user(db: AsyncSession, email: str, password: str):
    """
    Versión asíncrona: en vez de `db.query()`, usamos `select()`,
    y `await db.execute(stmt)` para obtener los resultados.
    """
    stmt = select(Usuario).where(Usuario.email == email)
    result = await db.execute(stmt)
    user = result.scalars().first()  # Obtenemos la instancia de Usuario (o None)

    if not user:
        return None

    if not verify_password(password, user.hashed_password):
        return None

    if user.estado != EstadoUsuario.activo:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Usuario inactivo o bloqueado",
        )

    return user
