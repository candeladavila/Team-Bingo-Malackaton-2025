from fastapi import APIRouter, HTTPException
from db.connection import connection

router = APIRouter(prefix="/episodios", tags=["episodios"])

@router.get("/{num_registro}")
async def get_episodio_por_id(num_registro: int):
    """
    Devuelve la información de un episodio hospitalario por su número de registro anual.
    """
    try:
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT "Número de registro anual", "FECHA_DE_INGRESO", "FECHA_DE_FIN_CONTACTO",
                       "Estancia Días", "TIPO_ALTA", "CIRCUNSTANCIA_DE_CONTACTO",
                       "Régimen Financiación", "PROCEDENCIA", "CONTINUIDAD_ASISTENCIAL",
                       "INGRESO_EN_UCI", "Días UCI", "EDAD", "EDAD_EN_INGRESO", "MES_DE_INGRESO"
                FROM DATOS_ORIGINALES
                WHERE "Número de registro anual" = :num_registro
            """, [num_registro])
            row = cursor.fetchone()
            if not row:
                raise HTTPException(status_code=404, detail="Episodio no encontrado")
            cols = [col[0] for col in cursor.description]
            return dict(zip(cols, row))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
