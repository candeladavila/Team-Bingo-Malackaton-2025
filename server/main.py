from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from services.patient_filter_service import PatientFilterService

app = FastAPI(title="Team Bingo Malackaton API", version="1.0.0")

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],  # Añadir más orígenes según sea necesario
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Instanciar el servicio de filtrado
filter_service = PatientFilterService()

# Modelos Pydantic
class FilterRequest(BaseModel):
    comunidades: List[str] = []
    año_nacimiento_min: int = 1950
    año_nacimiento_max: int = 2005
    sexo: List[str] = []
    diagnosticos: List[str] = []
    centros: List[str] = []
    page: int = 1
    rows_per_page: int = 20

class PatientRecord(BaseModel):
    id: int
    nombre: str
    comunidad: str
    año_nacimiento: int
    sexo: str
    diagnostico: str
    centro: str
    fecha_ingreso: str
    fecha_fin_contacto: str
    estancia_dias: int

class FilterResponse(BaseModel):
    data: List[PatientRecord]
    total_records: int
    current_page: int
    total_pages: int
    rows_per_page: int

@app.get("/")
async def root():
    return {"message": "Team Bingo Malackaton API - Funcionando correctamente"}

@app.post("/api/filter-patients", response_model=FilterResponse)
async def filter_patients(filters: FilterRequest):
    """
    Filtra pacientes según los criterios especificados
    """
    try:
        # Convertir el modelo Pydantic a diccionario
        filter_dict = {
            "comunidades": filters.comunidades,
            "año_nacimiento_min": filters.año_nacimiento_min,
            "año_nacimiento_max": filters.año_nacimiento_max,
            "sexo": filters.sexo,
            "diagnosticos": filters.diagnosticos,
            "centros": filters.centros
        }
        
        # Usar el servicio para obtener datos filtrados
        result = filter_service.get_filtered_patients(
            filter_dict, 
            filters.page, 
            filters.rows_per_page
        )
        
        # Convertir datos a modelos Pydantic
        patients = [PatientRecord(**patient) for patient in result["data"]]
        
        return FilterResponse(
            data=patients,
            total_records=result["total_records"],
            current_page=result["current_page"],
            total_pages=result["total_pages"],
            rows_per_page=result["rows_per_page"]
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al filtrar datos: {str(e)}")

@app.get("/api/patients", response_model=FilterResponse)
async def get_patients(
    page: int = Query(1, ge=1),
    rows_per_page: int = Query(20, ge=1, le=100)
):
    """
    Obtiene todos los pacientes con paginación (sin filtros)
    """
    filters = FilterRequest(page=page, rows_per_page=rows_per_page)
    return await filter_patients(filters)

@app.get("/api/filter-options")
async def get_filter_options():
    """
    Obtiene las opciones disponibles para los filtros
    """
    try:
        options = filter_service.get_filter_options()
        return options
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al obtener opciones de filtro: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)