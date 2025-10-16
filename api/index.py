import sys
import os

# Añade la carpeta 'server' al path para poder importar el backend
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
SERVER_DIR = os.path.join(BASE_DIR, "..", "server")
sys.path.append(os.path.normpath(SERVER_DIR))

# Importa la app FastAPI desde server/main.py
from server.main import app