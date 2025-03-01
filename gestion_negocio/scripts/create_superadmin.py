import os
import bcrypt
from sqlalchemy.orm import Session
from database import SessionLocal
from models.usuarios import Usuario
from services.auth_service import get_password_hash

# Ejemplo
def create_superadmin():
    db: Session = SessionLocal()
    email_superadmin = "cristiven16@gmail.com"
    existing = db.query(Usuario).filter_by(email=email_superadmin).first()
    if existing:
        print("Ya existe un usuario con ese email. Saliendo.")
        return
    
    # hashear contraseña
    hashed = get_password_hash("cristian1")
    nuevo = Usuario(
        nombre="Cristian Molina",
        email=email_superadmin,
        hashed_password=hashed,
        rol_id=3,  # ID del rol SuperAdmin
        organizacion_id=None  # no pertenece a una organización específica
    )
    db.add(nuevo)
    db.commit()
    db.close()
    print("SuperAdmin creado con éxito.")

if __name__ == "__main__":
    create_superadmin()
