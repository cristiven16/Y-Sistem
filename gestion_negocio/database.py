import os
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import text  # Importa text explícitamente
from dotenv import load_dotenv

# Carga las variables de entorno desde .env *SOLO* en el entorno local.
if os.getenv("GOOGLE_CLOUD_PROJECT") is None:
    load_dotenv()

# Cloud SQL connection name (automáticamente establecido por Cloud Run en la pestaña "Conexiones").
cloud_sql_connection_name = os.environ.get("CLOUD_SQL_CONNECTION_NAME")

# Construct the database URL based on the environment.
if cloud_sql_connection_name:
    # En Cloud Run, usa pg8000 y el socket Unix.
    db_host = f"/cloudsql/{cloud_sql_connection_name}"
    # Usa la URL SIMPLIFICADA para Cloud Run + Cloud SQL Proxy.
    database_url = f"postgresql+asyncpg://:@{db_host}"  #  <-- URL SIMPLIFICADA
    print("DEBUG => Cloud Run database_url:", database_url)

else:
    # En entorno LOCAL, usa .env y la configuración local (con pg8000 o psycopg2).
    db_user = os.getenv("DB_USER", "postgres")  # Valor por defecto para desarrollo local.
    db_password = os.getenv("DB_PASSWORD", "")    # ¡Usa una contraseña REAL, incluso localmente!
    db_name = os.getenv("DB_NAME", "postgres")
    db_host = os.getenv("DB_HOST", "localhost")  # O la IP si tu DB no está en localhost.
    db_port = os.getenv("DB_PORT", "5432")       # Puerto por defecto de PostgreSQL.
    # Elige el driver para desarrollo local (pg8000 recomendado):
    # database_url = f"postgresql+psycopg2://{db_user}:{db_password}@{db_host}:{db_port}/{db_name}" # Para psycopg2
    database_url = f"postgresql+asyncpg://{db_user}:{db_password}@{db_host}:{db_port}/{db_name}"  # Para pg8000
    print("DEBUG => Local database_url:", database_url)

if not cloud_sql_connection_name and os.getenv("GOOGLE_CLOUD_PROJECT") is not None: # Error si estamos en CR y no se configuro.
    raise ValueError("CLOUD_SQL_CONNECTION_NAME is not set. Configure Cloud SQL connection in Cloud Run.")

# Create the SQLAlchemy engine (ASÍNCRONO)
engine = create_async_engine(database_url)

# Create a session factory (ASÍNCRONA)
AsyncSessionLocal = sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)

# Dependency to get a database session (for FastAPI) (ASÍNCRONA)
async def get_db():
    db = AsyncSessionLocal()
    try:
        yield db
    finally:
        await db.close()