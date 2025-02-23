from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from database import get_db
from schemas.clientes import ClienteSchema, ClienteResponseSchema
from models.clientes import Cliente

router = APIRouter(prefix="/clientes", tags=["Clientes"])

def normalize_text(text: str) -> str:
    return text.replace("á", "a").replace("é", "e").replace("í", "i").replace("ó", "o").replace("ú", "u")

@router.post("/", response_model=dict)
def crear_cliente(cliente: ClienteSchema, db: Session = Depends(get_db)):
    cliente.nombre_razon_social = normalize_text(cliente.nombre_razon_social)
    cliente.numero_documento = cliente.numero_documento.strip()

    existe_cliente = db.query(Cliente).filter(Cliente.numero_documento == cliente.numero_documento).first()
    if existe_cliente:
        raise HTTPException(status_code=400, detail="El número de identificación ya está registrado.")

    nuevo_cliente = Cliente(**cliente.dict())
    db.add(nuevo_cliente)
    db.commit()
    db.refresh(nuevo_cliente)
    return {"message": "Cliente creado con éxito", "id": nuevo_cliente.id, "numero_documento": nuevo_cliente.numero_documento}

@router.get("/", response_model=list[ClienteSchema])
def obtener_clientes(db: Session = Depends(get_db), search: str = Query(None, description="Buscar cliente por nombre")):
    query = db.query(Cliente)
    
    if search:
        normalized_search = normalize_text(search)
        search_terms = normalized_search.split()
        for term in search_terms:
            query = query.filter(func.replace(func.replace(Cliente.nombre_razon_social, "á", "a"), "é", "e").ilike(f"%{term}%"))
    
    clientes = query.all()
    return [ClienteSchema(**cliente.__dict__) for cliente in clientes]

@router.put("/{cliente_id}", response_model=ClienteSchema)
def actualizar_cliente(cliente_id: int, cliente_actualizado: ClienteSchema, db: Session = Depends(get_db)):
    cliente_db = db.query(Cliente).filter(Cliente.id == cliente_id).first()
    
    if not cliente_db:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")
    
    if cliente_actualizado.numero_documento != cliente_db.numero_documento:
        cliente_existente = db.query(Cliente).filter(
            Cliente.numero_documento == cliente_actualizado.numero_documento,
            Cliente.id != cliente_id
        ).first()
        if cliente_existente:
            raise HTTPException(status_code=400, detail=f"El número de identificación {cliente_actualizado.numero_documento} ya está registrado en otro cliente.")
    
    # ✅ Normalizar nombre antes de actualizar
    cliente_actualizado.nombre_razon_social = normalize_text(cliente_actualizado.nombre_razon_social)
    
    for key, value in cliente_actualizado.dict(exclude_unset=True).items():
        setattr(cliente_db, key, value)
    
    db.commit()
    db.refresh(cliente_db)
    return cliente_db

@router.delete("/{cliente_id}")
def eliminar_cliente(cliente_id: int, db: Session = Depends(get_db)):
    cliente_db = db.query(Cliente).filter(Cliente.id == cliente_id).first()
    if not cliente_db:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")

    db.delete(cliente_db)
    db.commit()
    return {"message": "Cliente eliminado correctamente"}
