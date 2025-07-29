# Dockerfile que ejecuta el script api.py con uvicorn en el puerto 8000
FROM python:3.12-slim
# Instalar dependencias del sistema
RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*
# Establecer el directorio de trabajo
WORKDIR /app
# Copiar el archivo requirements.txt y el script api.py al contenedor
COPY requirements.txt app.py /app/
# Instalar las dependencias de Python
RUN pip install --no-cache-dir -r requirements.txt
# Exponer el puerto 8000
EXPOSE 8000
# Comando para ejecutar el script api.py con uvicorn en modo de desarrollo
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]