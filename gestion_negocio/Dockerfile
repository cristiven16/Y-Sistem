FROM python:3.11-slim

# Establece el directorio de trabajo
WORKDIR /app

# Copia el archivo requirements.txt
COPY requirements.txt .

# Instala las dependencias
RUN pip install --no-cache-dir -r requirements.txt

# Descarga e instala Cloud SQL Proxy (¡MUY IMPORTANTE!)
RUN apt-get update && apt-get install -y --no-install-recommends wget && \
    wget https://storage.googleapis.com/cloud-sql-connectors/cloud-sql-proxy/v2.9.1/cloud-sql-proxy.linux.amd64 -O cloud_sql_proxy && \
    chmod +x cloud_sql_proxy

# Crea un usuario sin privilegios.  ¡Importante hacerlo DESPUÉS de instalar dependencias y proxy!
RUN adduser --disabled-password --gecos "" fastapiuser
USER fastapiuser


# Copia el resto del código de la aplicación.  Esto incluye alembic.ini y el directorio /alembic/
COPY . .

# Expone el puerto 8080
EXPOSE 8080

# Usa Gunicorn con Uvicorn workers para ejecutar la aplicación FastAPI
CMD ["gunicorn", "main:app", "-k", "uvicorn.workers.UvicornWorker", "--bind", "0.0.0.0:8080"]