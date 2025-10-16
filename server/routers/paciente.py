from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from db.connection import connection

router = APIRouter(prefix="/pacientes", tags=["pacientes"])

class PacientesFiltro(BaseModel):
    comunidades: Optional[List[str]] = []
    sexo: Optional[List[str]] = []
    añoNacimiento: Optional[List[int]] = []  # [inicio, fin]
    diagnosticos: Optional[List[str]] = []
    page: Optional[int] = 1
    rowsPerPage: Optional[int] = 20

@router.post("/filter")
async def filtrar_pacientes(filtros: PacientesFiltro):
    """
    Devuelve los pacientes aplicando varios filtros simultáneamente.
    """
    try:
        query = """
            SELECT DISTINCT "CIP_SNS_RECODIFICADO", "NOMBRE", "FECHA_DE_NACIMIENTO", "SEXO",
                   "País Nacimiento", "País Residencia", "Comunidad Autónoma", "DIAGNOSTICO"
            FROM DATOS_ORIGINALES
            WHERE 1=1
        """
        params = {}

        # Filtro por comunidades
        if filtros.comunidades:
            query += " AND UPPER(\"Comunidad Autónoma\") IN ({})".format(
                ",".join([f":com{i}" for i in range(len(filtros.comunidades))])
            )
            for i, c in enumerate(filtros.comunidades):
                params[f"com{i}"] = c.upper()

        # Filtro por sexo
        if filtros.sexo:
            query += " AND UPPER(SEXO) IN ({})".format(
                ",".join([f":sexo{i}" for i in range(len(filtros.sexo))])
            )
            for i, s in enumerate(filtros.sexo):
                params[f"sexo{i}"] = s.upper()

        # Filtro por diagnóstico
        if filtros.diagnosticos:
            query += " AND UPPER(DIAGNOSTICO) IN ({})".format(
                ",".join([f":diag{i}" for i in range(len(filtros.diagnosticos))])
            )
            for i, d in enumerate(filtros.diagnosticos):
                params[f"diag{i}"] = d.upper()

        # Filtro por rango de año de nacimiento (MM/DD/YY)
        if filtros.añoNacimiento and len(filtros.añoNacimiento) == 2:
            query += """
                AND TO_NUMBER(
                    CASE 
                        WHEN SUBSTR("FECHA_DE_NACIMIENTO", 7, 2) <= '30' THEN '20' || SUBSTR("FECHA_DE_NACIMIENTO", 7, 2)
                        ELSE '19' || SUBSTR("FECHA_DE_NACIMIENTO", 7, 2)
                    END
                ) BETWEEN :inicio AND :fin
            """
            params["inicio"] = filtros.añoNacimiento[0]
            params["fin"] = filtros.añoNacimiento[1]

        # Orden y paginación
        offset = (filtros.page - 1) * filtros.rowsPerPage
        query += " ORDER BY \"NOMBRE\" OFFSET :offset ROWS FETCH NEXT :rows ROWS ONLY"
        params["offset"] = offset
        params["rows"] = filtros.rowsPerPage

        # Ejecutar consulta
        with connection.cursor() as cursor:
            cursor.execute(query, params)
            cols = [col[0] for col in cursor.description]
            data = [dict(zip(cols, row)) for row in cursor.fetchall()]

        # Contar total de registros para paginación (opcional: simplificado)
        total = len(data)  # Ideal sería hacer un COUNT real con los mismos filtros

        return {"data": data, "total": total}

    except Exception as e:
        import traceback
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))
