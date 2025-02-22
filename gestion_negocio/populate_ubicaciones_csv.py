import csv
import os
import unicodedata
from sqlalchemy import text
from database import SessionLocal
from models.ubicaciones import Ciudad, Departamento

# 📌 Ruta del archivo CSV en la raíz del proyecto
CSV_FILE_PATH = "Datos_corregidos_Municipios.csv"

# 📌 Función para normalizar nombres (eliminar tildes y espacios extra)
def normalizar_nombre(nombre):
    return unicodedata.normalize('NFKD', nombre).encode('ASCII', 'ignore').decode('utf-8').strip().lower()

# 📌 Verificar si el archivo CSV existe
if not os.path.exists(CSV_FILE_PATH):
    print(f"❌ Error: El archivo {CSV_FILE_PATH} no se encontró en la raíz del proyecto.")
    exit()

# 📌 Crear una sesión de base de datos
db = SessionLocal()

# 📌 Eliminar todos los registros de departamentos y municipios antes de insertar nuevos datos
db.execute(text("TRUNCATE TABLE ciudades RESTART IDENTITY CASCADE;"))
db.execute(text("TRUNCATE TABLE departamentos RESTART IDENTITY CASCADE;"))
db.commit()

print("🗑️ Se han eliminado todos los registros de departamentos y municipios y se han reiniciado los IDs.")

# 📌 Contador de municipios insertados
municipios_insertados = 0  

# 📌 Leer el archivo CSV
with open(CSV_FILE_PATH, newline='', encoding='utf-8') as csvfile:
    csv_reader = csv.reader(csvfile)
    next(csv_reader)  # Saltar la cabecera

    for row in csv_reader:
        try:
            codigo_departamento, nombre_departamento, codigo_municipio, nombre_municipio = row

            # 📌 Asegurar que los códigos sean enteros y tengan el formato correcto
            codigo_departamento = str(codigo_departamento).zfill(2)  # Formato 2 dígitos
            codigo_municipio = str(codigo_departamento) + str(codigo_municipio).zfill(3)  # Formato correcto: 5 dígitos

            # 📌 Normalizar nombres
            nombre_departamento_normalizado = normalizar_nombre(nombre_departamento)
            nombre_municipio_normalizado = normalizar_nombre(nombre_municipio)
            nombre_municipio_unico = f"{nombre_municipio_normalizado} ({nombre_departamento_normalizado})"

            # 📌 Insertar departamento si no existe
            departamento_existente = db.query(Departamento).filter_by(id=codigo_departamento).first()
            if not departamento_existente:
                departamento = Departamento(id=codigo_departamento, nombre=nombre_departamento_normalizado)
                db.add(departamento)
                db.commit()

            # 📌 Verificar si el municipio ya existe antes de insertarlo
            municipio_existente = db.query(Ciudad).filter_by(id=codigo_municipio).first()
            if municipio_existente:
                print(f"⚠️ Municipio ya existe: {codigo_municipio} - {nombre_municipio_unico}, omitiendo...")
                continue  # Saltar si ya existe

            # 📌 Insertar municipio con nombre único
            municipio = Ciudad(id=codigo_municipio, nombre=nombre_municipio_unico, departamento_id=codigo_departamento)
            db.add(municipio)
            db.commit()
            municipios_insertados += 1  # Aumentar contador

            # 📌 Mostrar cada municipio insertado
            print(f"✅ Insertado: {codigo_municipio} - {nombre_municipio_unico}")

        except ValueError as e:
            print(f"⚠️ Error procesando: {row}, error: {e}")

# 📌 Contar el total de departamentos y municipios en la base de datos
total_departamentos = db.query(Departamento).count()
total_municipios = db.query(Ciudad).count()

# 📌 Mostrar los totales
print(f"📊 Total de departamentos: {total_departamentos}")
print(f"📊 Total de municipios: {total_municipios}")

# 📌 Cerrar la conexión con la base de datos
db.close()

print(f"🚀 {municipios_insertados} municipios han sido insertados correctamente.")
