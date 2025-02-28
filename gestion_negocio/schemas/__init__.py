from .clientes import ClienteSchema, ClienteResponseSchema
from .proveedores import ProveedorSchema, ProveedorResponseSchema
from .empleados import EmpleadoBase, EmpleadoResponseSchema, EmpleadoCreateUpdateSchema
from .cuentas_wallet import CuentaWalletSchema, CuentaWalletResponseSchema
from .chats import ChatSchema, ChatResponseSchema
from .productos import ProductoSchema, ProductoResponseSchema
from .ventas import PedidoCreateSchema, PedidoResponseSchema
from .tesoreria import TransaccionSchema, TransaccionResponseSchema
from .common_schemas import TipoDocumentoSchema, DepartamentoSchema, CiudadSchema
