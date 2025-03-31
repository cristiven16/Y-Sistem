import os
import sys
from logging.config import fileConfig

from alembic import context
from sqlalchemy import create_engine, pool

# Añadimos /app al sys.path para que las importaciones funcionen
# igual que en tu contenedor (especialmente en Cloud Build).
sys.path.insert(0, "/app")

# Importar aquí tus modelos para que Alembic sepa qué migrar:
from models import Base

# Cargamos la configuración de Alembic
config = context.config

# (Opcional) Configuración de logging según alembic.ini
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Metadatos a partir de tus modelos
target_metadata = Base.metadata

def get_sync_database_url() -> str:
    """
    Retorna la URL de conexión a Postgres de forma SÍNCRONA,
    usando las mismas variables que 'database.py', pero con
    'pg8000' para Alembic.
    """
    db_user = os.getenv("DB_USER", "postgres")
    db_pass = os.getenv("DB_PASSWORD", "")
    db_name = os.getenv("DB_NAME", "postgres")
    cloud_sql_connection_name = os.getenv("CLOUD_SQL_CONNECTION_NAME")

    if cloud_sql_connection_name:
        # Conexión vía socket Unix (Cloud SQL)
        return (
            f"postgresql+pg8000://{db_user}:{db_pass}@/{db_name}"
            f"?unix_sock=/cloudsql/{cloud_sql_connection_name}/.s.PGSQL.5432"
        )
    else:
        # Conexión estándar (host/puerto)
        db_host = os.getenv("DB_HOST", "localhost")
        db_port = os.getenv("DB_PORT", "5432")
        return (
            f"postgresql+pg8000://{db_user}:{db_pass}@{db_host}:{db_port}/{db_name}"
        )

def run_migrations_offline() -> None:
    """
    Modo offline: Alembic renderiza el SQL sin conectarse a la DB.
    """
    url = get_sync_database_url()
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()

def run_migrations_online() -> None:
    """
    Modo online: Alembic se conecta a la DB y ejecuta directamente.
    """
    url = get_sync_database_url()

    # Creamos un engine síncrono (con pg8000) solo para migraciones
    connectable = create_engine(url, poolclass=pool.NullPool)

    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata
        )
        with context.begin_transaction():
            context.run_migrations()

# Alembic decidirá si va offline o online según el comando
if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
