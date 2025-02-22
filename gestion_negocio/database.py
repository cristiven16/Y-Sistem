from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
import os
from dotenv import load_dotenv

# Cargar las variables de entorno desde .env
load_dotenv()

# Obtener la URL de la base de datos desde .env
DATABASE_URL = os.getenv("DATABASE_URL")

# Validar que la URL de la base de datos se haya cargado correctamente
if not DATABASE_URL:
    raise ValueError("DATABASE_URL no está configurada en el archivo .env")

# Configuración de la conexión con SQLAlchemy (síncrono)
engine = create_engine(DATABASE_URL)  # ⚠️ Asegurar que es `postgresql://`, NO `postgresql+asyncpg://`
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Definir la base de datos para los modelos
Base = declarative_base()

# ✅ Importar modelos para que SQLAlchemy los registre correctamente
import models

# ✅ Función para obtener la sesión de la base de datos
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
