from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from models.catalogos import (TipoDocumento, RegimenTributario, TipoPersona, Moneda, TarifaPrecios, ActividadEconomica,
    FormaPago, Retencion, TipoMarketing, Sucursal, RutaLogistica, Vendedor)

router = APIRouter(prefix="/catalogos", tags=["Catálogos"])

router = APIRouter(prefix="/catalogos", tags=["Catálogos"])

@router.get("/tipos-documento")
def obtener_tipos_documento(db: Session = Depends(get_db)):
    return db.query(TipoDocumento).all()

@router.get("/regimenes-tributarios")
def obtener_regimenes_tributarios(db: Session = Depends(get_db)):
    return db.query(RegimenTributario).all()

@router.get("/tipos-persona")
def obtener_tipos_persona(db: Session = Depends(get_db)):
    return db.query(TipoPersona).all()

@router.get("/monedas")
def obtener_monedas(db: Session = Depends(get_db)):
    return db.query(Moneda).all()

@router.get("/tarifas-precios")
def obtener_tarifas_precios(db: Session = Depends(get_db)):
    return db.query(TarifaPrecios).all()

@router.get("/actividades-economicas")
def obtener_actividades_economicas(db: Session = Depends(get_db)):
    return db.query(ActividadEconomica).all()

@router.get("/formas-pago")
def obtener_formas_pago(db: Session = Depends(get_db)):
    return db.query(FormaPago).all()

@router.get("/retenciones")
def obtener_retenciones(db: Session = Depends(get_db)):
    return db.query(Retencion).all()

@router.get("/tipos-marketing")
def obtener_tipos_marketing(db: Session = Depends(get_db)):
    return db.query(TipoMarketing).all()

@router.get("/sucursales")
def obtener_sucursales(db: Session = Depends(get_db)):
    return db.query(Sucursal).all()

@router.get("/rutas-logisticas")
def obtener_rutas_logisticas(db: Session = Depends(get_db)):
    return db.query(RutaLogistica).all()

@router.get("/vendedores")
def obtener_vendedores(db: Session = Depends(get_db)):
    return db.query(Vendedor).all()