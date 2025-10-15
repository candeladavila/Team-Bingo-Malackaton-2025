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
                SELECT DISTINCT "CIP_SNS_RECODIFICADO", "NOMBRE", "FECHA_DE_NACIMIENTO", "SEXO",
                       "País Nacimiento", "País Residencia", "Comunidad Autónoma"
                FROM DATOS_ORIGINALES
                WHERE TO_DATE("FECHA_DE_NACIMIENTO", 'YYYY-MM-DD')
                      BETWEEN TO_DATE(:inicio, 'YYYY-MM-DD') AND TO_DATE(:fin, 'YYYY-MM-DD')
                ORDER BY "FECHA_DE_NACIMIENTO"
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
                SELECT DISTINCT "CIP_SNS_RECODIFICADO", "NOMBRE", "FECHA_DE_NACIMIENTO", "SEXO",
                       "País Nacimiento", "País Residencia", "Comunidad Autónoma"
                FROM DATOS_ORIGINALES
                WHERE UPPER("SEXO") = UPPER(:sexo)
                ORDER BY "NOMBRE"
            """, [sexo])
            cols = [col[0] for col in cursor.description]
            data = [dict(zip(cols, row)) for row in cursor.fetchall()]
            return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
