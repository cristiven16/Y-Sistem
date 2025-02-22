from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from schemas.tesoreria import TransaccionSchema, TransaccionResponseSchema
from models.tesoreria import Transaccion

router = APIRouter(prefix="/tesoreria", tags=["Tesorería"])

@router.post("/", response_model=TransaccionResponseSchema)
def registrar_transaccion(transaccion: TransaccionSchema, db: Session = Depends(get_db)):
    nueva_transaccion = Transaccion(**transaccion.dict())
    db.add(nueva_transaccion)
    db.commit()
    db.refresh(nueva_transaccion)
    return nueva_transaccion
