import os
import sys
from logging.config import fileConfig

from alembic import context
from sqlalchemy import create_engine, pool

# Ajuste del path para importar tus modelos (CORREGIDO)
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../../")))  # Añade la raíz del proyecto al path

# Ahora la importación debería funcionar CORRECTAMENTE
from gestion_negocio.models import Base  #  <- Importante: Corregido

config = context.config
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = Base.metadata

def get_sync_database_url() -> str:
    """
    Retorna la URL de la base de datos.
    Usa el formato correcto para el sidecar de Cloud SQL Proxy.
    """

    db_user = os.getenv("DB_USER", "postgres")  # Valor por defecto
    db_pass = os.getenv("DB_PASSWORD", "")  # Contraseña (vacía por defecto)
    db_name = os.getenv("DB_NAME", "postgres")  # Valor por defecto
    cloud_sql_connection_name = os.getenv("CLOUD_SQL_CONNECTION_NAME")

    if cloud_sql_connection_name:
        # Usamos el formato de conexión para el SIDECAR de Cloud SQL Proxy.
        # La ruta /cloudsql/ es especial, y Cloud Run la maneja automáticamente.
        return f"postgresql+pg8000://{db_user}:{db_pass}@/{db_name}?unix_sock=/cloudsql/{cloud_sql_connection_name}/.s.PGSQL.5432"
    else:
        # Conexión local (para desarrollo)
        db_host = os.getenv("DB_HOST", "localhost")
        db_port = os.getenv("DB_PORT", "5432")
        return f"postgresql+pg8000://{db_user}:{db_pass}@{db_host}:{db_port}/{db_name}"


def run_migrations_offline() -> None:
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
    url = get_sync_database_url()
    # Usa el pool de conexiones predeterminado de SQLAlchemy (NO NullPool)
    connectable = create_engine(url)

    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            compare_type=True  # Buena práctica: detecta cambios de tipo de columna
        )
        with context.begin_transaction():
            context.run_migrations()

if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()