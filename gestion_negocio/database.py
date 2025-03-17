# gestion_negocio/database.py

import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# 1. Cargar variables de entorno en local
#    (En producción, Cloud Run inyecta las variables como "Secrets" o "Environment Variables"
#     y NO depende de .env)
load_dotenv()

# 2. Leer valores (host, user, pass, db) que usarás en local y en producción
db_host = os.getenv("DB_HOST")  # Por ej., "/cloudsql/PROJECT:REGION:INSTANCE" en Cloud Run
db_user = os.getenv("DB_USER", "postgres")
db_password = os.getenv("DB_PASSWORD", "")
db_name = os.getenv("DB_NAME", "mydb")

# 3. (Opcional) Revisa si existe DATABASE_URL para local o entornos que lo usen
database_url = os.getenv("DATABASE_URL")

print("DEBUG => final database_url:", database_url)

if not database_url:
    # No hay DATABASE_URL, así que construiremos la URL manualmente según db_host
    if db_host and db_host.startswith("/cloudsql/"):
        # A) Conexión vía socket (Cloud Run con --add-cloudsql-instances)
        #    Ejemplo: postgresql+pg8000://user:pass@/dbname?unix_sock=/cloudsql/...
        database_url = (
            f"postgresql+pg8000://{db_user}:{db_password}@/{db_name}"
            f"?unix_sock={db_host}/.s.PGSQL.5432"
        )
    else:
        # B) Conexión TCP, usada en local o si tu DB usa IP/hostname
        db_port = os.getenv("DB_PORT", "5432")
        # Si db_host no está definido, usar 'localhost' como fallback en local
        database_url = (
            f"postgresql+pg8000://{db_user}:{db_password}@"
            f"{db_host or 'localhost'}:{db_port}/{db_name}"
        )

if not database_url:
    raise ValueError("No se pudo determinar la URL de la base de datos (database_url es None).")

# 4. Crear el engine de SQLAlchemy
engine = create_engine(database_url)

# 5. Crear el SessionLocal para FastAPI
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# 6. Dependencia de FastAPI para obtener la sesión
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
