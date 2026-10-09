# backend/Dockerfile

# Usamos una imagen ligera de Python
FROM python:3.11-slim

# Evita que Python escriba archivos .pyc y permite ver los logs en tiempo real
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Directorio de trabajo dentro del contenedor
WORKDIR /app

# Instalamos dependencias del sistema necesarias (ej. para psycopg2)
RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copiamos primero los requerimientos para aprovechar la caché de Docker
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copiamos el resto del código
COPY . .

# Exponemos el puerto (debe coincidir con el docker-compose)
EXPOSE 8000

# Comando para levantar la app (Ajustar según su framework)
# Para FastAPI: uvicorn main:app --host 0.0.0.0 --port 8000
# CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
# Para Django: python manage.py runserver 0.0.0.0:8000
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]