from pydantic import BaseModel
from datetime import datetime

class ChatSchema(BaseModel):
    usuario_id: int
    mensaje: str
    fecha: datetime = datetime.utcnow()

class ChatResponseSchema(ChatSchema):
    id: int