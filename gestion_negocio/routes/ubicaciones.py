# gestion_negocio/routes/ubicaciones.py
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from database import get_db
from models.ubicaciones import Departamento, Ciudad
from dependencies.auth import get_current_user

router = APIRouter(prefix="/ubicaciones", tags=["Ubicaciones"], dependencies=[Depends(get_current_user)])

@router.get("/departamentos")
def obtener_departamentos(db: Session = Depends(get_db)):
    """
    Retorna la lista de departamentos.
    """
    return db.query(Departamento).all()

@router.get("/ciudades")
def obtener_ciudades(departamento_id: int = Query(None), db: Session = Depends(get_db)):
    """
    Retorna la lista de ciudades de un departamento (si se especifica),
    o todas las ciudades si no se envía 'departamento_id'.
    """
    if departamento_id is not None:
        return db.query(Ciudad).filter(Ciudad.departamento_id == departamento_id).all()
    else:
        return db.query(Ciudad).all()