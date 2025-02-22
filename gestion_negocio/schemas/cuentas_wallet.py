from pydantic import BaseModel
from decimal import Decimal

class CuentaWalletSchema(BaseModel):
    usuario_id: int
    saldo: Decimal = 0.00

class CuentaWalletResponseSchema(CuentaWalletSchema):
    id: int