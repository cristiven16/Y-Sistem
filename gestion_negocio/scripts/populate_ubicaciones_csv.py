import csv
import os
import unicodedata
from sqlalchemy import text
from database import SessionLocal
from models.ubicaciones import Ciudad, Departamento

CSV_FILE_PATH = "Datos_corregidos_Municipios.csv"

def normalizar_nombre(nombre):
    """
    Convierte en mayúsculas, conserva la 'Ñ' y quita las tildes de otras vocales.
    Ejemplo: "Cañón" -> "CAÑON", "José" -> "JOSE", "Peña" -> "PEÑA".
    """
    # 1. Convertir a mayúsculas
    nombre_upper = nombre.upper()
    
    # 2. Proteger la Ñ con un placeholder
    placeholder = "||ENE||"
    nombre_upper = nombre_upper.replace("Ñ", placeholder)
    
    # 3. Normalizar para quitar tildes de letras A, E, I, O, U (y otras),
    #    pero no afectar nuestro placeholder.
    sin_tildes = (
        unicodedata.normalize('NFKD', nombre_upper)
                   .encode('ASCII', 'ignore')
                   .decode('utf-8')
    )
    
    # 4. Restaurar el placeholder => "Ñ"
    resultado = sin_tildes.replace(placeholder, "Ñ").strip()
    
    return resultado

if not os.path.exists(CSV_FILE_PATH):
    print(f"❌ Error: El archivo {CSV_FILE_PATH} no se encontró.")
    exit()

db = SessionLocal()

# Limpiar tablas:
db.execute(text("TRUNCATE TABLE ciudades RESTART IDENTITY CASCADE;"))
db.execute(text("TRUNCATE TABLE departamentos RESTART IDENTITY CASCADE;"))
db.commit()

print("🗑️ Se han eliminado todos los registros de departamentos y municipios y reiniciado los IDs.")

municipios_insertados = 0  

with open(CSV_FILE_PATH, newline='', encoding='utf-8') as csvfile:
    csv_reader = csv.reader(csvfile)
    next(csv_reader)  # Saltar la cabecera

    for row in csv_reader:
        try:
            codigo_departamento, nombre_departamento, codigo_municipio, nombre_municipio = row

            codigo_departamento = str(codigo_departamento).zfill(2)
            codigo_municipio = str(codigo_departamento) + str(codigo_municipio).zfill(3)

            # Normalizar manteniendo Ñ
            nombre_departamento_normalizado = normalizar_nombre(nombre_departamento)
            nombre_municipio_normalizado = normalizar_nombre(nombre_municipio)
            nombre_municipio_unico = f"{nombre_municipio_normalizado} ({nombre_departamento_normalizado})"

            departamento_existente = db.query(Departamento).filter_by(id=codigo_departamento).first()
            if not departamento_existente:
                departamento = Departamento(id=codigo_departamento, nombre=nombre_departamento_normalizado)
                db.add(departamento)
                db.commit()

            municipio_existente = db.query(Ciudad).filter_by(id=codigo_municipio).first()
            if municipio_existente:
                print(f"⚠️ Municipio ya existe: {codigo_municipio} - {nombre_municipio_unico}, omitiendo...")
                continue

            municipio = Ciudad(
                id=codigo_municipio,
                nombre=nombre_municipio_unico,
                departamento_id=codigo_departamento
            )
            db.add(municipio)
            db.commit()
            municipios_insertados += 1

            print(f"✅ Insertado: {codigo_municipio} - {nombre_municipio_unico}")

        except ValueError as e:
            print(f"⚠️ Error procesando: {row}, error: {e}")

total_departamentos = db.query(Departamento).count()
total_municipios = db.query(Ciudad).count()

print(f"📊 Total de departamentos: {total_departamentos}")
print(f"📊 Total de municipios: {total_municipios}")

db.close()

print(f"🚀 {municipios_insertados} municipios han sido insertados correctamente.")
