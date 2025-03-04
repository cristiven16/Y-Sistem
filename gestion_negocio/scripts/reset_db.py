from database import engine
from models import Base  # Importa el Base que conoce todos los modelos

print("⚠️ Eliminando y recreando todas las tablas en la base de datos...")

Base.metadata.drop_all(bind=engine)
Base.metadata.create_all(bind=engine)

print("✅ Base de datos reiniciada correctamente.")
