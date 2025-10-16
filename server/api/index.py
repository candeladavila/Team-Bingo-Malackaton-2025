import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from main import app

# Vercel Python Serverless Function entrypoint
# Exposes the FastAPI app as 'app' for Vercel
