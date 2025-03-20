import os
import sys
from logging.config import fileConfig

from alembic import context
from sqlalchemy import create_engine, pool

# Ajuste del path para importar tus modelos (CORREGIDO)
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../../")))

# Importa tus modelos
from gestion_negocio.models import Base  #  <- Importante: Corregido

config = context.config

# --- CAMBIOS IMPORTANTES AQUÍ ---
# Ya NO leemos alembic.ini para la configuración.  Lo configuramos todo programáticamente.
# Esto evita cualquier problema con version_path_separator.

# Configuración de logging (opcional, pero recomendable)
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = Base.metadata

def get_sync_database_url() -> str:
    db_user = os.getenv("DB_USER", "postgres")
    db_pass = os.getenv("DB_PASSWORD", "")
    db_name = os.getenv("DB_NAME", "postgres")
    cloud_sql_connection_name = os.getenv("CLOUD_SQL_CONNECTION_NAME")

    if cloud_sql_connection_name:
        return f"postgresql+pg8000://{db_user}:{db_pass}@/{db_name}?unix_sock=/cloudsql/{cloud_sql_connection_name}/.s.PGSQL.5432"
    else:
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
    connectable = create_engine(url)  # Usamos el pooling por defecto

    with connectable.connect() as connection:
        # Configuración directa, sin leer de alembic.ini
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            compare_type=True,
            # CONFIGURACIÓN EXPLÍCITA DE RUTAS:
            version_table_schema=config.get_main_option("version_table_schema", "public"),  # O el esquema que uses
            version_table=config.get_main_option("version_table", "alembic_version"),
            include_schemas=True, #Asegura que se incluyan todos los esquemas
            # Ya no necesitamos esto, porque lo configuramos directamente:
            # version_path_separator=os.sep,  <-- ¡ELIMINADO!
        )

        with context.begin_transaction():
            context.run_migrations()

if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()