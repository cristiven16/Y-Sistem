FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

RUN apt-get update && apt-get install -y --no-install-recommends curl && \
    curl -o /app/cloud_sql_proxy https://storage.googleapis.com/cloud-sql-connectors/cloud-sql-proxy/v2.15.1/cloud-sql-proxy.linux.amd64 && \
    chmod +x /app/cloud_sql_proxy

RUN adduser --disabled-password --gecos "" fastapiuser

# TEMPORALMENTE COMENTADO para el paso de migración:
# USER fastapiuser

RUN pip install alembic

RUN alembic --help

COPY . .

EXPOSE 8080

CMD ["gunicorn", "main:app", "-k", "uvicorn.workers.UvicornWorker", "--bind", "0.0.0.0:8080"]