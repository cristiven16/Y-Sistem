FROM python:3.11-slim

# Establece el directorio de trabajo
WORKDIR /app

# Copia e instala dependencias
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Crea un usuario sin privilegios
RUN adduser --disabled-password --gecos "" fastapiuser
USER fastapiuser

# Copia el resto de tu aplicación
COPY . .

# Expone el puerto 8080
EXPOSE 8080

# Usa Gunicorn con uvicorn workers para FastAPI
CMD ["gunicorn", "main:app", "-k", "uvicorn.workers.UvicornWorker", "--bind", "0.0.0.0:8080"]
