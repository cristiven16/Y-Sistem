FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Descarga e instala Cloud SQL Proxy usando curl (¡CORREGIDO!)
RUN curl -o cloud-sql-proxy https://storage.googleapis.com/cloud-sql-connectors/cloud-sql-proxy/v2.15.1/cloud-sql-proxy.linux.amd64 && \
    chmod +x cloud_sql_proxy

RUN adduser --disabled-password --gecos "" fastapiuser
USER fastapiuser

COPY . .

EXPOSE 8080

CMD ["gunicorn", "main:app", "-k", "uvicorn.workers.UvicornWorker", "--bind", "0.0.0.0:8080"]