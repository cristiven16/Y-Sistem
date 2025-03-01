from sqlalchemy import Column, Integer, Numeric, ForeignKey
from sqlalchemy.orm import relationship
from . import Base

class CuentaWallet(Base):
    __tablename__ = "cuentas_wallet"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    usuario_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False)
    saldo = Column(Numeric(10, 2), default=0.00)

    usuario = relationship("Usuario")
