# gestion_negocio/database.py

import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# 1) Cargar variables de entorno en local
load_dotenv()  # Esto solo hará efecto en entorno local si existe .env

# 2) Leer valores (host, user, pass, db, port)
db_host = os.getenv("DB_HOST")
db_user = os.getenv("DB_USER", "postgres")
db_password = os.getenv("DB_PASSWORD", "")
db_name = os.getenv("DB_NAME", "mydb")
db_port = os.getenv("DB_PORT", "5432")

# => Prints de debug (para asegurarte de que todo se está leyendo correctamente)
print("DEBUG => DB_HOST:", db_host)
print("DEBUG => DB_USER:", db_user)
print("DEBUG => DB_PASSWORD:", db_password)
print("DEBUG => DB_NAME:", db_name)
 
# 3) Revisar si existe DATABASE_URL ya definida en el entorno
database_url = os.getenv("DATABASE_URL")
#print("DEBUG => DATABASE_URL inicial:", database_url)

if not database_url:
    # Si no hay DATABASE_URL definida, construimos una según el entorno
    if db_host and db_host.startswith("/cloudsql/"):
        # Conexión vía socket (por ejemplo, en Cloud Run + Cloud SQL)
        # host=/cloudsql/<PROJECT>:<REGION>:<INSTANCE>/.s.PGSQL.5432
        database_url = (
            f"postgresql+psycopg2://{db_user}:{db_password}@/{db_name}"
            f"?host={db_host}/.s.PGSQL.5432"
        )
    else:
        # Conexión TCP normal (por IP/hostname)
        database_url = (
            f"postgresql+psycopg2://{db_user}:{db_password}@"
            f"{db_host or 'localhost'}:{db_port}/{db_name}"
        )

print("DEBUG => final database_url:", database_url)

if not database_url:
    raise ValueError("No se pudo determinar la URL de la base de datos (database_url es None).")

# 4) Crear el engine con la URL resultante
engine = create_engine(database_url)

# 5) Definir la sesión
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# 6) Dependencia para obtener la sesión en tus endpoints de FastAPI
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
 