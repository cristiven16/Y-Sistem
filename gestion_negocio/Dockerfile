FROM python:3.11-slim

WORKDIR /app

# Copiar solo lo necesario para instalar dependencias PRIMERO.  Esto optimiza las capas de Docker.
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Instalar curl y el proxy de Cloud SQL.  Esto va *después* de instalar las dependencias
# de Python, para que no se reinstale cada vez que cambie el código de la aplicación.
RUN apt-get update && apt-get install -y --no-install-recommends curl && \
    curl -o /app/cloud_sql_proxy https://storage.googleapis.com/cloud-sql-connectors/cloud-sql-proxy/v2.15.1/cloud-sql-proxy.linux.amd64 && \
    chmod +x /app/cloud_sql_proxy

# Crear el usuario fastapiuser *después* de instalar las dependencias del sistema.
RUN adduser --disabled-password --gecos "" fastapiuser

# Copiar el resto del código de la aplicación.
COPY . .
#Establecer el usuario después de copiar los archivos.
USER fastapiuser

# No es necesario ejecutar 'alembic --help' aquí. Ya lo instalamos con requirements.txt.

EXPOSE 8080

CMD ["gunicorn", "main:app", "-k", "uvicorn.workers.UvicornWorker", "--bind", "0.0.0.0:8080"]