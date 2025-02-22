from fastapi import APIRouter, Depends, HTTPException
from schemas.usuarios import UsuarioRegistro, UsuarioLogin
from sqlalchemy.orm import Session
from database import get_db

router = APIRouter(prefix="/auth", tags=["Autenticación"])

@router.post("/register")
def register(user: UsuarioRegistro, db: Session = Depends(get_db)):
    # Lógica para registrar usuario
    return {"message": "Usuario registrado correctamente"}

@router.post("/login")
def login(user: UsuarioLogin, db: Session = Depends(get_db)):
    # Lógica para autenticación
    return {"token": "fake-jwt-token"}
