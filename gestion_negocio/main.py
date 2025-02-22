from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from routes import auth, clientes, productos, ventas, tesoreria, cuentas_wallet, chats, catalogos

# Crear la base de datos y las tablas (si no existen)
Base.metadata.create_all(bind=engine)

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
app.include_router(clientes.router)
app.include_router(productos.router)
app.include_router(ventas.router)
app.include_router(tesoreria.router)
app.include_router(cuentas_wallet.router)
app.include_router(chats.router)
app.include_router(catalogos.router)

# Ruta de Prueba
@app.get("/")
def home():
    return {"message": "API funcionando correctamente 🚀"}
