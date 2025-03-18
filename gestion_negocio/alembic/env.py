# gestion_negocio/alembic/env.py
import os
import sys
from logging.config import fileConfig

from sqlalchemy import engine_from_config, pool
from alembic import context
from dotenv import load_dotenv

# Añade el directorio raíz del proyecto a sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))
from models import Base  # Importa Base desde tu carpeta models


# Carga .env SOLO si estamos en local.  Usa la misma lógica que en database.py.
if os.getenv("GOOGLE_CLOUD_PROJECT") is None:
    load_dotenv()

# Configuración
config = context.config
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = Base.metadata

def get_database_url():
    """Construye la URL de la base de datos dinámicamente."""
    cloud_sql_connection_name = os.environ.get("CLOUD_SQL_CONNECTION_NAME")

    if cloud_sql_connection_name:
        # En Cloud Run, usa pg8000 y el socket Unix.
        db_host = f"/cloudsql/{cloud_sql_connection_name}"
        return f"postgresql+pg8000://{os.environ.get('DB_USER')}:{os.environ.get('DB_PASS')}@{db_host}/{os.environ.get('DB_NAME')}"
    else:
        # En local, usa .env y la configuración local (con pg8000 o psycopg2).
        db_user = os.getenv("DB_USER", "postgres")
        db_password = os.getenv("DB_PASSWORD", "")
        db_name = os.getenv("DB_NAME", "postgres")
        db_host = os.getenv("DB_HOST", "localhost")
        db_port = os.getenv("DB_PORT", "5432")
        # Elige el driver (pg8000 recomendado):
        # return f"postgresql+psycopg2://{db_user}:{db_password}@{db_host}:{db_port}/{db_name}" # Para psycopg2
        return f"postgresql+pg8000://{db_user}:{db_password}@{db_host}:{db_port}/{db_name}"  # Para pg8000

def run_migrations_offline() -> None:
    """Ejecuta migraciones en modo 'offline'."""
    url = get_database_url()  # Usa la función para obtener la URL.
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )
    with context.begin_transaction():
        context.run_migrations()

def run_migrations_online() -> None:
    """Ejecuta migraciones en modo 'online'."""
    # Usa la URL dinámica.  No es necesario pasar 'engine_from_config'.
    engine = create_engine(get_database_url(), poolclass=pool.NullPool)
    with engine.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            compare_type=True
        )
        with context.begin_transaction():
            context.run_migrations()

if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()