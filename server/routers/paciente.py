from fastapi import APIRouter, HTTPException
from db.connection import connection

router = APIRouter(prefix="/pacientes", tags=["pacientes"])

# Filtrar por rango de fechas de nacimiento
@router.get("/rango-fechas")
async def get_pacientes_por_rango_fechas(fecha_inicio: str, fecha_fin: str):
    """
    Devuelve los pacientes cuya fecha de nacimiento esté entre fecha_inicio y fecha_fin (inclusive).
    Formato esperado: YYYY-MM-DD
    """
    try:
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT id_paciente, CIP_SNS_Recodificado, Nombre, Fecha_nacimiento, Sexo,
                       País_nacimiento, País_residencia
                FROM Paciente
                WHERE Fecha_nacimiento BETWEEN TO_DATE(:inicio, 'YYYY-MM-DD') AND TO_DATE(:fin, 'YYYY-MM-DD')
                ORDER BY Fecha_nacimiento
            """, [fecha_inicio, fecha_fin])
            cols = [col[0] for col in cursor.description]
            data = [dict(zip(cols, row)) for row in cursor.fetchall()]
            return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Filtrar por sexo
@router.get("/sexo/{sexo}")
async def get_pacientes_por_sexo(sexo: str):
    """
    Devuelve los pacientes filtrados por sexo ('M' o 'F').
    """
    try:
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT id_paciente, CIP_SNS_Recodificado, Nombre, Fecha_nacimiento, Sexo,
                       País_nacimiento, País_residencia
                FROM Paciente
                WHERE UPPER(Sexo) = UPPER(:sexo)
                ORDER BY Nombre
            """, [sexo])
            cols = [col[0] for col in cursor.description]
            data = [dict(zip(cols, row)) for row in cursor.fetchall()]
            return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
