# gestion_negocio/database.py

import os
from dotenv import load_dotenv
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

# 1) Cargar variables de entorno en local
load_dotenv()

# 2) Leer valores (host, user, pass, db)
db_host = os.getenv("DB_HOST")
db_user = os.getenv("DB_USER", "postgres")
db_password = os.getenv("DB_PASSWORD", "")
db_name = os.getenv("DB_NAME", "mydb")

# => Prints de debug:
print("DEBUG => DB_HOST:", db_host)
print("DEBUG => DB_USER:", db_user)
print("DEBUG => DB_PASSWORD:", db_password)
print("DEBUG => DB_NAME:", db_name)

# 3) Revisar si existe DATABASE_URL
database_url = os.getenv("DATABASE_URL")
print("DEBUG => DATABASE_URL inicial:", database_url)

if not database_url:
    if db_host and db_host.startswith("/cloudsql/"):
        # Socket en Cloud Run
        database_url = (
            f"postgresql+pg8000://{db_user}:{db_password}@/{db_name}"
            f"?unix_sock={db_host}/.s.PGSQL.5432"
        )
    else:
        # Conexión TCP local (IP/hostname)
        db_port = os.getenv("DB_PORT", "5432")
        database_url = (
            f"postgresql+pg8000://{db_user}:{db_password}@"
            f"{db_host or 'localhost'}:{db_port}/{db_name}"
        )

print("DEBUG => final database_url:", database_url)

if not database_url:
    raise ValueError("No se pudo determinar la URL de la base de datos (database_url es None).")

# 4) Crear engine
engine = create_engine(database_url)

# 5) SessionLocal
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
