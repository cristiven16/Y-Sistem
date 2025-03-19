# gestion_negocio/alembic/env.py

import os
import sys
from logging.config import fileConfig

from alembic import context
from sqlalchemy import create_engine, pool

# Solo si no estamos en GCP, cargamos .env (opcional)
if os.getenv("GOOGLE_CLOUD_PROJECT") is None:
    from dotenv import load_dotenv
    load_dotenv()

# Ajustar el path para importar tus modelos, si es necesario
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

from models import Base  # Asegúrate de que models/__init__.py define Base

config = context.config
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = Base.metadata

def get_sync_database_url() -> str:
    """
    Retorna la URL de la base de datos con pg8000.
    - Si detecta `CLOUD_SQL_CONNECTION_NAME`, asume que en Cloud Build/Run usarás Auth Proxy con HOST=127.0.0.1, PORT=5432.
    - Caso contrario, usa DB_HOST, DB_PORT, etc. de tu .env o variables de entorno.
    """

    cloud_sql_connection_name = os.getenv("CLOUD_SQL_CONNECTION_NAME")

    db_user = os.getenv("DB_USER", "postgres")
    db_password = os.getenv("DB_PASSWORD", "")
    db_name = os.getenv("DB_NAME", "postgres")
    db_host = os.getenv("DB_HOST", "")
    db_port = os.getenv("DB_PORT", "5432")

    # Si existe la variable CLOUD_SQL_CONNECTION_NAME,
    # asumimos que en tu pipeline/entorno levantas un proxy en 127.0.0.1:5432
    # (o Cloud Run con host=127.0.0.1). No usamos "/cloudsql/..." con pg8000.
    if cloud_sql_connection_name:
        # Forzamos host=127.0.0.1 y el puerto 5432, en la idea de que el proxy está en local
        if not db_host:
            db_host = "127.0.0.1"
        if not db_port:
            db_port = "5432"

        # Generamos la URL
        return f"postgresql+pg8000://{db_user}:{db_password}@{db_host}:{db_port}/{db_name}"
    else:
        # Caso local / fallback
        if not db_host:
            db_host = "localhost"
        return f"postgresql+pg8000://{db_user}:{db_password}@{db_host}:{db_port}/{db_name}"

def run_migrations_offline() -> None:
    """Ejecuta migraciones en modo 'offline'."""
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
    """Ejecuta migraciones en modo 'online'."""
    url = get_sync_database_url()
    connectable = create_engine(url, poolclass=pool.NullPool)

    with connectable.connect() as connection:
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
