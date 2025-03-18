import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

# Carga las variables de entorno desde .env *SOLO* en el entorno local.
# Usamos una comprobación robusta para determinar si estamos en Cloud Run o no.
if os.getenv("GOOGLE_CLOUD_PROJECT") is None:
    load_dotenv()

# Cloud SQL connection name (automáticamente establecido por Cloud Run en la pestaña "Conexiones").
cloud_sql_connection_name = os.environ.get("CLOUD_SQL_CONNECTION_NAME")

# Construct the database URL based on the environment.
if cloud_sql_connection_name:
    # En Cloud Run: Usa pg8000 y el socket Unix.
    db_host = f"/cloudsql/{cloud_sql_connection_name}"
    database_url = f"postgresql+pg8000://:@{db_host}"  # <- URL SIMPLIFICADA
    print("DEBUG => Cloud Run database_url:", database_url)

else:
    # En entorno LOCAL: Usa .env y la configuración local (con pg8000 o psycopg2).
    db_user = os.getenv("DB_USER", "postgres")  # Valor por defecto para desarrollo local.
    db_password = os.getenv("DB_PASSWORD", "")    # ¡Usa una contraseña real, incluso localmente!
    db_name = os.getenv("DB_NAME", "postgres")
    db_host = os.getenv("DB_HOST", "localhost")  # O la IP si tu DB no está en localhost.
    db_port = os.getenv("DB_PORT", "5432")       # Puerto por defecto de PostgreSQL.
    # Elige el driver para desarrollo local (pg8000 recomendado):
    # database_url = f"postgresql+psycopg2://{db_user}:{db_password}@{db_host}:{db_port}/{db_name}" # Para psycopg2
    database_url = f"postgresql+pg8000://{db_user}:{db_password}@{db_host}:{db_port}/{db_name}"  # Para pg8000
    print("DEBUG => Local database_url:", database_url)

# Validación: Aseguramos que CLOUD_SQL_CONNECTION_NAME esté presente en Cloud Run.
if not cloud_sql_connection_name and os.getenv("GOOGLE_CLOUD_PROJECT") is not None:
    raise ValueError("CLOUD_SQL_CONNECTION_NAME is not set. Configure Cloud SQL connection in Cloud Run.")


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