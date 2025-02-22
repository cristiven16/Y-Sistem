from database import SessionLocal
from models.catalogos import (
    TipoDocumento, RegimenTributario, TipoPersona, Moneda, TarifaPrecios, 
    ActividadEconomica, FormaPago, Retencion, TipoMarketing, 
    Sucursal, RutaLogistica, Vendedor
)

# Crear una sesión de base de datos
db = SessionLocal()

def verificar_y_insertar(modelo, datos):
    """ Verifica si una tabla está vacía y, si lo está, inserta los valores iniciales. """
    if db.query(modelo).count() == 0:
        db.bulk_save_objects([modelo(**d) for d in datos])
        print(f"✅ Datos insertados en {modelo.__tablename__}")

# 📌 Insertar valores iniciales
verificar_y_insertar(TipoDocumento, [{"nombre": "Cédula de ciudadanía (CC)"}])
verificar_y_insertar(RegimenTributario, [{"nombre": "No responsable del IVA"}])
verificar_y_insertar(TipoPersona, [{"nombre": "Común"}])
verificar_y_insertar(Moneda, [{"codigo": "COP", "nombre": "Peso Colombiano"}])
verificar_y_insertar(TarifaPrecios, [{"nombre": "Tarifa normal"}])
verificar_y_insertar(ActividadEconomica, [{"nombre": "Comercio al por menor"}])
verificar_y_insertar(FormaPago, [{"nombre": "Contado"}])
verificar_y_insertar(Retencion, [{"nombre": "No aplica"}])
verificar_y_insertar(TipoMarketing, [{"nombre": "Facebook"}])
verificar_y_insertar(Sucursal, [{"nombre": "Principal"}])
verificar_y_insertar(RutaLogistica, [{"nombre": "Ruta 1"}])
verificar_y_insertar(Vendedor, [{"nombre": "Vendedor Genérico", "identificacion": "000000000"}])

# Confirmar cambios en la base de datos
db.commit()
db.close()

print("🚀 Todas las tablas tienen al menos un valor inicial.")
