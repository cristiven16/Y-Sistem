import os
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

# Carga variables de entorno locales desde .env (solo en desarrollo local)
if os.getenv("GOOGLE_CLOUD_PROJECT") is None:
    load_dotenv()

# Recupera la variable que inyecta Cloud Run al habilitar Conexiones de Cloud SQL
cloud_sql_connection_name = os.environ.get("CLOUD_SQL_CONNECTION_NAME")

# Parámetros que SÍ debes configurar manualmente
db_user = os.getenv("DB_USER")       # Debes crearla en "Variables y secretos"
db_password = os.getenv("DB_PASSWORD")
db_name = os.getenv("DB_NAME")

if cloud_sql_connection_name:
    # Estás en Cloud Run. Usar socket Unix en /cloudsql/<INSTANCE>.
    # Ejemplo: "postgresql+asyncpg://usuario:password@/basededatos?host=/cloudsql/proyecto:region:instancia"
    if not (db_user and db_password and db_name):
        raise ValueError("Faltan DB_USER, DB_PASSWORD o DB_NAME en las variables de entorno de Cloud Run.")
    database_url = (
        f"postgresql+asyncpg://{db_user}:{db_password}"
        f"@/{db_name}?host=/cloudsql/{cloud_sql_connection_name}"
    )
    print("DEBUG => Conexión en Cloud Run usando Unix socket:", database_url)

else:
    # Modo local.
    # Aquí sí puedes usar DB_HOST, DB_PORT si lo deseas.
    # O asumes localhost:5432 con el usuario y DB que quieras.
    db_host = os.getenv("DB_HOST", "localhost")
    db_port = os.getenv("DB_PORT", "5432")
    print("DEBUG => Conexión local a PostgreSQL en", db_host, ":", db_port)

    database_url = (
        f"postgresql+asyncpg://{db_user}:{db_password}"
        f"@{db_host}:{db_port}/{db_name}"
    )
    print("DEBUG => Conexión local database_url:", database_url)

# Crea el engine asíncrono
engine = create_async_engine(database_url)

# Crea la factoría de sesiones asíncronas
AsyncSessionLocal = sessionmaker(
    bind=engine,
    expire_on_commit=False,
    class_=AsyncSession
)

# Dependencia para FastAPI (o tu framework) que proporciona la sesión
async def get_db():
    async with AsyncSessionLocal() as db:
        yield db
