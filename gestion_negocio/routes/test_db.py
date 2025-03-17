# gestion_negocio/routes/test_db.py
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from sqlalchemy import text

router = APIRouter()

@router.get("/test-db")
def test_db(db: Session = Depends(get_db)):
    """
    Este endpoint ejecuta un SELECT 1 en la base de datos
    para comprobar la conexión.
    """
    result = db.execute(text("SELECT 1")).fetchone()
    return {"db_test": result[0]}
