from fastapi import APIRouter, HTTPException
from db.connection import connection

router = APIRouter(prefix="/centros", tags=["centros"])

@router.get("/comunidad/{comunidad}")
async def get_centros_por_comunidad(comunidad: str):
    """
    Devuelve los centros pertenecientes a una comunidad autónoma dada.
    """
    try:
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT DISTINCT COMUNIDAD_AUTONOMA, CENTRO_RECODIFICADO
                FROM DATOS_ORIGINALES
                WHERE UPPER(COMUNIDAD_AUTONOMA) = UPPER(:comunidad)
                ORDER BY CENTRO_RECODIFICADO
            """, [comunidad])
            cols = [col[0] for col in cursor.description]
            data = [dict(zip(cols, row)) for row in cursor.fetchall()]
            return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
