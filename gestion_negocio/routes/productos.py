from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from schemas.productos import ProductoSchema, ProductoResponseSchema
from models.productos import Producto

router = APIRouter(prefix="/productos", tags=["Productos"])

@router.get("/", response_model=list[ProductoResponseSchema])
def obtener_productos(db: Session = Depends(get_db)):
    productos = db.query(Producto).all()
    return productos

