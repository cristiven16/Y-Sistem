FROM python:3.11-slim

# Crea directorio de trabajo
WORKDIR /app

# Copia primero el requirements.txt para aprovechar la caché de Docker
COPY requirements.txt .

# Instala dependencias + Alembic + (opcional) Cloud SQL Proxy en un solo RUN
RUN apt-get update && apt-get install -y --no-install-recommends curl && \
    pip install --no-cache-dir -r requirements.txt && \
    pip install --no-cache-dir alembic && \
    curl -o /app/cloud_sql_proxy https://storage.googleapis.com/cloud-sql-connectors/cloud-sql-proxy/v2.15.1/cloud-sql-proxy.linux.amd64 && \
    chmod +x /app/cloud_sql_proxy && \
    # Limpieza de paquetes para reducir tamaño de la imagen
    apt-get remove -y curl && apt-get autoremove -y && apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Crea un usuario no-root
RUN adduser --disabled-password --gecos "" fastapiuser

# Cambia a dicho usuario (por seguridad)
USER fastapiuser

# Copia el resto de archivos de la app
COPY . .

# Expone el puerto 8080
EXPOSE 8080

# Comando para correr con Gunicorn + Uvicorn
CMD ["gunicorn", "main:app", "-k", "uvicorn.workers.UvicornWorker", "--bind", "0.0.0.0:8080"]
