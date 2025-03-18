import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# 1) Cargar variables de entorno en local (SOLO para desarrollo)
load_dotenv()

# 2) Leer variables de entorno.  Usa SIEMPRE variables de entorno, NUNCA valores hardcodeados en producción.
db_user = os.getenv("DB_USER", "postgres")  # Valor predeterminado para desarrollo
db_password = os.getenv("DB_PASSWORD", "")   # Valor predeterminado para desarrollo
db_name = os.getenv("DB_NAME", "mydb")      # Valor predeterminado para desarrollo

#  MUY IMPORTANTE: Usa CLOUD_SQL_CONNECTION_NAME para Cloud Run.
cloud_sql_connection_name = os.getenv("CLOUD_SQL_CONNECTION_NAME")

# Prints de debug (¡déjalos mientras solucionas problemas!)
print("DEBUG => DB_USER:", db_user)
print("DEBUG => DB_PASSWORD:", db_password)  # Esto NO debería mostrarse en producción
print("DEBUG => DB_NAME:", db_name)
print("DEBUG => CLOUD_SQL_CONNECTION_NAME:", cloud_sql_connection_name)


# 3) Construir la URL de la base de datos. Prioriza CLOUD_SQL_CONNECTION_NAME.
if cloud_sql_connection_name:
    # Conexión a Cloud SQL desde Cloud Run (usa el socket Unix)
    db_host = f"/cloudsql/{cloud_sql_connection_name}"
    database_url = f"postgresql+psycopg2://{db_user}:{db_password}@{db_host}/{db_name}"

else:
    # Conexión local (usa TCP) - Usa SIEMPRE el puerto 5432 si estás usando el proxy.
    db_host = os.getenv("DB_HOST", "localhost")  # Valor predeterminado para desarrollo
    database_url = f"postgresql+psycopg2://{db_user}:{db_password}@{db_host}:5432/{db_name}"

print("DEBUG => final database_url:", database_url) # Debug

if not database_url: #Ya no es estrictamente necesario, pero está bien dejarlo.
    raise ValueError("No se pudo determinar la URL de la base de datos.")

# 4) Crear el motor de SQLAlchemy
engine = create_engine(database_url)

# 5) Crear la sesión
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# 6) Dependencia para obtener la sesión (para FastAPI)
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()