# gestion_negocio/main.py

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import engine, get_db
import models

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

app = FastAPI(title="API de Gestión Empresarial", version="1.0")

# Aquí limitamos CORS a y-sistem.web.app y y-sistem.firebaseapp.com
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://y-sistem.web.app",
        "https://y-sistem.firebaseapp.com",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Incluir Routers
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

@app.get("/")
def home():
    return {"message": "API funcionando correctamente 🚀"}
