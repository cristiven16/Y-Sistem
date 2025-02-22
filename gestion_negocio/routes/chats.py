from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from schemas.chats import ChatSchema, ChatResponseSchema
from models.chats import Chat

router = APIRouter(prefix="/chats", tags=["Chats"])

@router.post("/", response_model=ChatResponseSchema)
def crear_mensaje_chat(chat: ChatSchema, db: Session = Depends(get_db)):
    nuevo_mensaje = Chat(**chat.dict())
    db.add(nuevo_mensaje)
    db.commit()
    db.refresh(nuevo_mensaje)
    return nuevo_mensaje

@router.get("/", response_model=list[ChatResponseSchema])
def obtener_mensajes_chat(db: Session = Depends(get_db)):
    return db.query(Chat).all()