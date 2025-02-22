from database import SessionLocal
from models.catalogos import (
    TipoDocumento, RegimenTributario, TipoPersona, Moneda, TarifaPrecios, 
    FormaPago, TipoMarketing
)

# Crear una sesión de base de datos
db = SessionLocal()

# 📌 Insertar tipos de identificación (Documentos) con abreviación en el mismo campo "nombre"
tipos_documento = [
    ("Número de Identificación Tributaria CO", "NIT"),
    ("Cédula de ciudadanía", "CC"),
    ("Pasaporte", "PSPT"),
    ("Cédula de extranjería", "CE"),
    ("Tarjeta de extranjería", "TE"),
    ("Documento de identificación extranjero", "DIE"),
    ("Permiso especial de permanencia", "PEP"),
    ("Tarjeta de identidad", "TI"),
    ("Registro civil", "RC"),
    ("Permiso por Protección Temporal", "PPT"),
    ("Registro Único de Información Fiscal", "RIF"),
    ("Identificación tributaria de otro país", "NE"),
]
db.bulk_save_objects([TipoDocumento(nombre=f"{nombre} ({abrev})") for nombre, abrev in tipos_documento])

# 📌 Insertar régimen tributario con predeterminado "No Responsable de IVA"
regimenes_tributarios = [
    "Régimen simplificado",
    "Régimen común",
    "Régimen simple",
    "Responsable del IVA",
    "No responsable del IVA",  # Este será el predeterminado
    "Régimen especial",
    "Régimen ordinario",
    "Gran contribuyente"
]
db.bulk_save_objects([RegimenTributario(nombre=r) for r in regimenes_tributarios])

# 📌 Insertar formas de pago con predeterminado "Contado"
formas_pago = [
    "Contado a 1 día",
    "Contado",  # Predeterminado
    "Crédito 7 días",
    "Crédito 15 días",
    "Crédito 30 días",
    "Crédito 60 días",
    "Crédito 90 días"
]
db.bulk_save_objects([FormaPago(nombre=f) for f in formas_pago])

# 📌 Insertar monedas con predeterminado "COP"
monedas = [
    ("COP", "Peso Colombiano"),  # Predeterminado
    ("USD", "Dólar Americano"),
    ("EUR", "Euro")
]
db.bulk_save_objects([Moneda(codigo=c, nombre=n) for c, n in monedas])

# 📌 Insertar tipos de cliente con predeterminado "Común"
tipos_cliente = [
    "Común",  # Predeterminado
    "Mayorista",
    "VIP",
    "Fiel"
]
db.bulk_save_objects([TipoPersona(nombre=t) for t in tipos_cliente])

# 📌 Insertar tarifas de precios con predeterminado "Tarifa normal"
tarifas_precios = [
    "Tarifa normal",  # Predeterminado
    "Por Mayor",
    "Especial" 
]
db.bulk_save_objects([TarifaPrecios(nombre=t) for t in tarifas_precios])  # <- Se usa "TarifaPrecios"

# 📌 Insertar tipos de marketing
tipos_marketing = ["Facebook", "Recomendación", "Televisión", "Radio"]
db.bulk_save_objects([TipoMarketing(nombre=t) for t in tipos_marketing])

# Confirmar cambios en la base de datos
db.commit()
db.close()

print("🚀 Datos de catálogos insertados correctamente.")
