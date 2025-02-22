from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from schemas.cuentas_wallet import CuentaWalletSchema, CuentaWalletResponseSchema
from models.cuentas_wallet import CuentaWallet

router = APIRouter(prefix="/cuentas-wallet", tags=["Cuentas Wallet"])

@router.post("/", response_model=CuentaWalletResponseSchema)
def crear_cuenta_wallet(cuenta_wallet: CuentaWalletSchema, db: Session = Depends(get_db)):
    nueva_cuenta = CuentaWallet(**cuenta_wallet.dict())
    db.add(nueva_cuenta)
    db.commit()
    db.refresh(nueva_cuenta)
    return nueva_cuenta

@router.get("/", response_model=list[CuentaWalletResponseSchema])
def obtener_cuentas_wallet(db: Session = Depends(get_db)):
    return db.query(CuentaWallet).all()