# gestion_negocio/database.py

import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Cargar variables de entorno de .env (útil en local, en producción Cloud Run no se usa).
load_dotenv()

# 1. Lógica para construir la URL según variables de entorno que definas en Cloud Run o local
db_host = os.getenv("DB_HOST")           # "/cloudsql/PROJECT:REGION:INSTANCE"
db_user = os.getenv("DB_USER", "postgres")
db_password = os.getenv("DB_PASSWORD", "")
db_name = os.getenv("DB_NAME", "mydb")

# 2. Si *también* tienes un fallback a DATABASE_URL (por ejemplo para local)
#    Revisa si ya existe la variable. Si no, la construirás manualmente según DB_HOST, etc.
database_url = os.getenv("DATABASE_URL")  # Podrías seguir usando si lo tienes local

if not database_url:
    # No hay DATABASE_URL, así que la creamos según DB_HOST
    if db_host and db_host.startswith("/cloudsql/"):
        # Conexión vía socket (Cloud Run)
        database_url = f"postgresql+pg8000://{db_user}:{db_password}@/{db_name}?unix_sock={db_host}/.s.PGSQL.5432"
    else:
        # Conexión TCP (local IP, localhost, etc.)
        db_port = os.getenv("DB_PORT", "5432")
        # Si DB_HOST es "localhost" o una IP, hacemos la URL normal
        database_url = f"postgresql+pg8000://{db_user}:{db_password}@{db_host or 'localhost'}:{db_port}/{db_name}"

if not database_url:
    raise ValueError("No se pudo determinar la URL de la base de datos")

# 3. Crear engine
engine = create_engine(database_url)

# Crear SessionLocal para las dependencias FastAPI
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Dependencia para endpoints
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
