from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from schemas.ventas import PedidoCreateSchema, PedidoResponseSchema
from models.ventas import Venta
from dependencies.auth import get_current_user

router = APIRouter(prefix="/ventas", tags=["Órdenes de Venta"], dependencies=[Depends(get_current_user)])

@router.post("/", response_model=PedidoResponseSchema)
def crear_pedido(pedido: PedidoCreateSchema, db: Session = Depends(get_db)):
    nuevo_pedido = Venta(**pedido.dict())
    db.add(nuevo_pedido)
    db.commit()
    db.refresh(nuevo_pedido)
    return nuevo_pedido
