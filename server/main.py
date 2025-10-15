from fastapi import FastAPI
from routers import paciente, centros, episodios

app = FastAPI(
    title="API Hospitalaria",
    description="Backend para consultar pacientes, centros y episodios desde Oracle",
    version="1.0.0"
)

## Ruta local --> http://127.0.0.1:8000
## Documentación automática: Swagger --> http://127.0.0.1:8000/docs

app.include_router(paciente.router)
app.include_router(centros.router)
app.include_router(episodios.router)
