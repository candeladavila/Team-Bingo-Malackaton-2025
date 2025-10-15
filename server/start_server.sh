#!/bin/bash

# Script para iniciar el servidor FastAPI

echo "Iniciando servidor de Team Bingo Malackaton..."
echo "Puerto: 8000"
echo "Para detener el servidor presiona Ctrl+C"

# Activar entorno virtual si existe
if [ -d "venv" ]; then
    echo "Activando entorno virtual..."
    source venv/bin/activate
fi

# Iniciar servidor con uvicorn
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload