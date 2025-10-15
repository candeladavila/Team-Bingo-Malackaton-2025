from fastapi import APIRouter, HTTPException
from db.connection import connection

router = APIRouter(prefix="/centros", tags=["centros"])

# Filtrar por comunidad autónoma
@router.get("/comunidad/{comunidad}")
async def get_centros_por_comunidad(comunidad: str):
    """
    Devuelve los centros que pertenecen a una comunidad autónoma dada.
    """
    try:
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT id_centro, Centro_Recodificado, Comunidad_Autónoma
                FROM Centro
                WHERE UPPER(Comunidad_Autónoma) = UPPER(:comunidad)
                ORDER BY Centro_Recodificado
            """, [comunidad])
            cols = [col[0] for col in cursor.description]
            data = [dict(zip(cols, row)) for row in cursor.fetchall()]
            return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
