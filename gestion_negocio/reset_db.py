from database import Base, engine
from models.usuarios import Usuario, Rol
from models.catalogos import TipoDocumento, RegimenTributario, TipoPersona, Moneda, TarifaPrecios, ActividadEconomica, FormaPago, Retencion, TipoMarketing, Sucursal, RutaLogistica, Vendedor
from models.productos import Producto
from models.ventas import Venta, DetalleVenta
from models.tesoreria import Transaccion
from models.categorias import Categoria
from models.clientes import Cliente
from models.cuentas_wallet import CuentaWallet
from models.chats import Chat
from models.ubicaciones import Departamento, Ciudad

print("⚠️ Eliminando y recreando todas las tablas en la base de datos...")

# Borrar y recrear todas las tablas
Base.metadata.drop_all(bind=engine)
Base.metadata.create_all(bind=engine)

print("✅ Base de datos reiniciada correctamente.")
