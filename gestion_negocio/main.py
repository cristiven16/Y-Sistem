# gestion_negocio/main.py

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Importar la sesión y el engine de la BD
from database import engine, get_db

# Importar tus modelos para que se registren en Base.metadata
import models

# Importar los routers
from routes import (
    auth,
    users,
    organizations,
    roles,
    clientes,
    empleados,
    proveedores,
    productos,
    ventas,
    tesoreria,
    cuentas_wallet,
    chats,
    catalogos,
    ubicaciones,
    planes,
    permissions
)

# OJO: Se quita la llamada a Base.metadata.create_all(bind=engine)
# porque alembic se encarga de manejar las migraciones y crear/modificar tablas.

# Inicializar FastAPI
app = FastAPI(title="API de Gestión Empresarial", version="1.0")


# Configurar CORS (si se conecta con frontend)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # ⚠ Cambiar en producción
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Incluir Rutas
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(organizations.router)
app.include_router(roles.router)
app.include_router(clientes.router)
app.include_router(proveedores.router)
app.include_router(empleados.router)
app.include_router(productos.router)
app.include_router(ventas.router)
app.include_router(tesoreria.router)
app.include_router(cuentas_wallet.router)
app.include_router(chats.router)
app.include_router(catalogos.router)
app.include_router(ubicaciones.router)
app.include_router(planes.router)
app.include_router(permissions.router)

# Ruta de Prueba
@app.get("/")
def home():
    return {"message": "API funcionando correctamente 🚀"}
