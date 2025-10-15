from fastapi import APIRouter, HTTPException
from db.connection import connection

router = APIRouter(prefix="/episodios", tags=["episodios"])

# 4️⃣ Consultar un episodio por su id
@router.get("/{id_episodio}")
async def get_episodio_por_id(id_episodio: int):
    """
    Devuelve la información de un episodio hospitalario por su id (Número de registro anual).
    """
    try:
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT id_episodio, id_paciente, id_centro, Fecha_ingreso, Fecha_fin_contacto,
                       Estancia_días, Tipo_alta, Circunstancia_contacto, Régimen_financiación,
                       Procedencia, Continuidad_asistencial, Ingreso_UCI, Días_UCI,
                       Edad, Edad_ingreso, Mes_ingreso
                FROM Episodio_Hospitalario
                WHERE id_episodio = :id
            """, [id_episodio])
            row = cursor.fetchone()
            if not row:
                raise HTTPException(status_code=404, detail="Episodio no encontrado")
            cols = [col[0] for col in cursor.description]
            return dict(zip(cols, row))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
