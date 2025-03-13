# gestion_negocio/models/__init__.py

from sqlalchemy.orm import declarative_base

# 1) Definir la única instancia de Base
Base = declarative_base()

# 2) Importar TODOS los modelos para que queden registrados en Base
from .usuarios import Usuario, EstadoUsuario
from .catalogos import (
    TipoDocumento, RegimenTributario, TipoPersona, Moneda,
    TarifaPrecios, ActividadEconomica, FormaPago, Retencion,
    TipoMarketing, RutaLogistica
)
from .productos import Producto
from .ventas import Venta, DetalleVenta
from .tesoreria import Transaccion
from .categorias import Categoria
from .clientes import Cliente
from .cuentas_wallet import CuentaWallet
from .chats import Chat
from .ubicaciones import Departamento, Ciudad
from .proveedores import Proveedor
from .empleados import Empleado
from .auditoria import AuditLog
from .organizaciones import Organizacion, EstadoOrganizacion, NumeracionTransaccion, Sucursal, TiendaVirtual, Bodega, CentroCosto, Caja, CuentaBancaria
from .planes import Plan
from .roles import Rol
from .permissions import Permission

# No hay que hacer nada más aquí; con esto, Base.metadata incluye todos tus modelos.
