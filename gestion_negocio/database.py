import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

# Carga las variables de entorno desde .env *SOLO* en el entorno local.
if os.getenv("GOOGLE_CLOUD_PROJECT") is None:  # Forma robusta de detectar si estamos en Cloud Run.
    load_dotenv()

# Cloud SQL connection name (automáticamente establecido por Cloud Run cuando se configura en la pestaña "Conexiones").
cloud_sql_connection_name = os.environ.get("CLOUD_SQL_CONNECTION_NAME")

# Construct the database URL based on the environment.
if cloud_sql_connection_name:
    # En Cloud Run, usa pg8000 y el socket Unix.
    db_host = f"/cloudsql/{cloud_sql_connection_name}"
    database_url = f"postgresql+pg8000://{os.environ.get('DB_USER')}:{os.environ.get('DB_PASS')}@{db_host}/{os.environ.get('DB_NAME')}"
    print("DEBUG => Cloud Run database_url:", database_url)

else:
    # En entorno LOCAL, usa .env y psycopg2 (o pg8000, si lo prefieres).
    db_user = os.getenv("DB_USER", "postgres")  # Valores por defecto para desarrollo local.
    db_password = os.getenv("DB_PASSWORD", "")    # ¡Usa una contraseña real, incluso localmente!
    db_name = os.getenv("DB_NAME", "postgres")
    db_host = os.getenv("DB_HOST", "localhost")  # O la IP si tu DB no está en localhost.
    db_port = os.getenv("DB_PORT", "5432")       # Puerto por defecto de PostgreSQL.

    # Elige el driver para desarrollo local (psycopg2 o pg8000).  Recomendado: pg8000
    # database_url = f"postgresql+psycopg2://{db_user}:{db_password}@{db_host}:{db_port}/{db_name}" # Para psycopg2
    database_url = f"postgresql+pg8000://{db_user}:{db_password}@{db_host}:{db_port}/{db_name}"  # Para pg8000
    print("DEBUG => Local database_url:", database_url)


if not cloud_sql_connection_name and os.getenv("GOOGLE_CLOUD_PROJECT") is not None: # Error si estamos en Cloud Run y no se configuro la conexión.
    raise ValueError("CLOUD_SQL_CONNECTION_NAME is not set.  Configure Cloud SQL connection in Cloud Run.")


# Create the SQLAlchemy engine
engine = create_engine(database_url)

# Create a session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Dependency to get a database session (for FastAPI)
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()