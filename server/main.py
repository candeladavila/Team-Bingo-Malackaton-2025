from fastapi import FastAPI
from routers import paciente
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="API Hospitalaria",
    description="Backend para consultar pacientes, centros y episodios desde Oracle",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # la URL de tu frontend
    allow_credentials=True,
    allow_methods=["*"],  # permite POST, GET, OPTIONS, etc.
    allow_headers=["*"],  # permite cualquier header
)

## Ruta local --> http://127.0.0.1:8000
## Documentación automática: Swagger --> http://127.0.0.1:8000/docs

app.include_router(paciente.router)

@app.get("/")
async def root():
    return {"message": "API Hospitalaria funcionando correctamente"}