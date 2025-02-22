from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from schemas.clientes import ClienteSchema, ClienteResponseSchema
from models.clientes import Cliente

router = APIRouter(prefix="/clientes", tags=["Clientes"])

@router.post("/", response_model=dict)
def crear_cliente(cliente: ClienteSchema, db: Session = Depends(get_db)):
    # Verificar si ya existe
    existe_cliente = db.query(Cliente).filter(Cliente.numero_documento == cliente.numero_documento).first()
    if existe_cliente:
        print(f"❌ ERROR: Cliente con número {cliente.numero_documento} ya registrado.")
        raise HTTPException(status_code=400, detail="El número de identificación ya está registrado.")

    print("✅ Creando cliente en la base de datos...")
    
    # Crear cliente
    nuevo_cliente = Cliente(**cliente.dict())
    db.add(nuevo_cliente)
    
    print("📝 Antes de commit()")
    db.commit()
    print("✅ Después de commit()")

    db.refresh(nuevo_cliente)

    print(f"🔍 Cliente creado: {nuevo_cliente.numero_documento} (ID: {nuevo_cliente.id})")
    
    return {
        "message": "Cliente creado con éxito",
        "id": nuevo_cliente.id,
        "numero_documento": nuevo_cliente.numero_documento
    }

@router.get("/", response_model=list[ClienteSchema])
def obtener_clientes(db: Session = Depends(get_db)):
    clientes = db.query(Cliente).all()
    
    print("🔍 Clientes obtenidos:", clientes)  # Debug

    # Convertir objetos SQLAlchemy a diccionarios serializables usando .__dict__
    clientes_dict = [ClienteSchema(**cliente.__dict__) for cliente in clientes]
    
    return clientes_dict



@router.put("/{cliente_id}", response_model=ClienteSchema)
def actualizar_cliente(cliente_id: int, cliente_actualizado: ClienteSchema, db: Session = Depends(get_db)):
    cliente_db = db.query(Cliente).filter(Cliente.id == cliente_id).first()
    
    if not cliente_db:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")
    
    # 🛠 Verificar si el número de documento ha cambiado
    if cliente_actualizado.numero_documento != cliente_db.numero_documento:
        cliente_existente = db.query(Cliente).filter(
            Cliente.numero_documento == cliente_actualizado.numero_documento,
            Cliente.id != cliente_id  # 🛠 Asegura que no sea el mismo cliente
        ).first()
        if cliente_existente:
            raise HTTPException(status_code=400, detail=f"El número de identificación {cliente_actualizado.numero_documento} ya está registrado en otro cliente.")
    
    # ✅ Actualizar los valores del cliente en la base de datos
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
