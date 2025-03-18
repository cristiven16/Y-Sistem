import os
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import text
from dotenv import load_dotenv

# Solo cargamos .env si NO estamos en Cloud (ejemplo local)
if os.getenv("GOOGLE_CLOUD_PROJECT") is None:
    load_dotenv()

cloud_sql_connection_name = os.environ.get("CLOUD_SQL_CONNECTION_NAME")

# Variables "básicas" las tomamos SIEMPRE (ya sea local o en cloud)
db_user = os.getenv("DB_USER", "postgres")
db_password = os.getenv("DB_PASSWORD", "")
db_name = os.getenv("DB_NAME", "postgres")

if cloud_sql_connection_name:
    # Socket de Unix con asyncpg
    database_url = (
        f"postgresql+asyncpg://{db_user}:{db_password}@/{db_name}"
        f"?host=/cloudsql/{cloud_sql_connection_name}"
    )
    print("DEBUG => Cloud Run database_url:", database_url)
else:
    # Modo local (o fallback)
    db_host = os.getenv("DB_HOST", "localhost")
    db_port = os.getenv("DB_PORT", "5432")
    database_url = (
        f"postgresql+asyncpg://{db_user}:{db_password}"
        f"@{db_host}:{db_port}/{db_name}"
    )
    print("DEBUG => Local database_url:", database_url)

# Creamos el engine asíncrono
engine = create_async_engine(database_url)

AsyncSessionLocal = sessionmaker(
    bind=engine,
    expire_on_commit=False,
    class_=AsyncSession
)

async def get_db():
    db = AsyncSessionLocal()
    try:
        yield db
    finally:
        await db.close()
