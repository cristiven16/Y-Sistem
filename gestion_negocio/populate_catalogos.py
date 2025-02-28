from database import SessionLocal
from models.catalogos import (
    TipoDocumento, RegimenTributario, TipoPersona, Moneda, TarifaPrecios, 
    FormaPago, TipoMarketing
)

# Crear una sesión de base de datos
db = SessionLocal()

# -- 1. Insertar tipos de identificación (Documentos) --
# Queremos que en la columna "nombre" se guarde "Nombre (Abreviatura)"
# y en la columna "abreviatura" se guarde solo la abreviatura.
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
db.bulk_save_objects([
    TipoDocumento(
        nombre=f"{nombre} ({abreviatura})",  # Ej: "Pasaporte (PSPT)"
        abreviatura=abreviatura             # Ej: "PSPT"
    )
    for nombre, abreviatura in tipos_documento
])

# -- 2. Insertar régimen tributario (ejemplo) --
regimenes_tributarios = [
    "Régimen simplificado",
    "Régimen común",
    "Régimen simple",
    "Responsable del IVA",
    "No responsable del IVA",  # predeterminado
    "Régimen especial",
    "Régimen ordinario",
    "Gran contribuyente"
]
db.bulk_save_objects([RegimenTributario(nombre=r) for r in regimenes_tributarios])

# -- 3. Insertar formas de pago (ejemplo) --
formas_pago = [
    "Contado",  # predeterminado
    "Contado a 1 día",
    "Crédito 7 días",
    "Crédito 15 días",
    "Crédito 30 días",
    "Crédito 60 días",
    "Crédito 90 días"
]
db.bulk_save_objects([FormaPago(nombre=f) for f in formas_pago])

# -- 4. Insertar monedas (ejemplo) --
monedas = [
    ("COP", "Peso Colombiano"),  # predeterminado
    ("USD", "Dólar Americano"),
    ("EUR", "Euro")
]
db.bulk_save_objects([Moneda(codigo=c, nombre=n) for c, n in monedas])

# -- 5. Insertar tipos de persona (ejemplo) --
# (Anteriormente se usaba una variable "tipos_cliente" que no existía; 
#  corrijo para usar la lista "tipos_persona").
tipos_persona = [
    "Persona Natural",  # predeterminado
    "Persona Jurídica"
]
db.bulk_save_objects([TipoPersona(nombre=t) for t in tipos_persona])

# -- 6. Insertar tarifas de precios (ejemplo) --
tarifas_precios = [
    "Tarifa normal",  # predeterminado
    "Por Mayor",
    "Especial" 
]
db.bulk_save_objects([TarifaPrecios(nombre=t) for t in tarifas_precios])

# -- 7. Insertar tipos de marketing (ejemplo) --
tipos_marketing = ["Facebook", "Recomendación", "Televisión", "Radio"]
db.bulk_save_objects([TipoMarketing(nombre=t) for t in tipos_marketing])

# Confirmar cambios en la base de datos
db.commit()
db.close()

print("🚀 Datos de catálogos insertados correctamente.")
