"""
Servicios para visualización de datos médicos - Version con nuevo formato
"""
from typing import List, Dict, Any
import oracledb
import os
from dotenv import load_dotenv

class VisualizationService:
    """Servicio para generar datos de visualización"""
    
    def __init__(self):
        # Solo cargar .env si estamos en desarrollo (no en Vercel)
        if os.environ.get("VERCEL") != "1":
            dotenv_path = os.path.join(os.path.dirname(__file__), '..', '.env')
            if os.path.exists(dotenv_path):
                load_dotenv(dotenv_path)

        self.wallet_path = os.getenv("WALLET_PATH")
        # Si wallet_path contiene ${PWD}, reemplazarlo con el directorio actual
        if self.wallet_path and "${PWD}" in self.wallet_path:
            current_dir = os.path.dirname(os.path.dirname(__file__))
            self.wallet_path = self.wallet_path.replace("${PWD}", current_dir)

        self.wallet_password = os.getenv("WALLET_PASSWORD")
        self.user = os.getenv("DB_USER")
        self.user_password = os.getenv("DB_PASSWORD")
        self.dsn = os.getenv("DB_TNS_ALIAS")

        # Validar que todas las variables críticas están presentes
        missing = [k for k, v in {
            'WALLET_PATH': self.wallet_path,
            'WALLET_PASSWORD': self.wallet_password,
            'DB_USER': self.user,
            'DB_PASSWORD': self.user_password,
            'DB_TNS_ALIAS': self.dsn
        }.items() if not v]
        if missing:
            raise RuntimeError(f"Faltan variables de entorno requeridas: {', '.join(missing)}")
    
    def get_connection(self):
        """Establece conexión con la base de datos Oracle"""
        return oracledb.connect(
            user=self.user,
            password=self.user_password,
            dsn=self.dsn,
            config_dir=self.wallet_path,
            wallet_location=self.wallet_path,
            wallet_password=self.wallet_password
        )
    
    def get_age_pyramid_data(self, diagnosis: str) -> List[Dict[str, Any]]:
        """
        Obtiene datos para pirámide poblacional filtrada por diagnóstico usando intervalos de edad
        Devuelve lista de objetos con formato: {intervalo: str, hombres: int, mujeres: int}
        """
        connection = None
        try:
            connection = self.get_connection()
            cursor = connection.cursor()
            
            # Definir intervalos de edad (cada 10 años)
            age_groups = ['0-9', '10-19', '20-29', '30-39', '40-49', '50-59', '60-69', '70-79', '80+']
            
            # Query combinada para obtener datos por sexo y grupo de edad
            # Usamos NOMBRE y CENTRO_RECODIFICADO para identificar pacientes únicos
            query = """
            WITH age_calculations AS (
                SELECT 
                    2024 - (CASE 
                        WHEN EXTRACT(YEAR FROM TO_DATE(FECHA_DE_NACIMIENTO, 'MM/DD/YY')) > 2025 
                        THEN EXTRACT(YEAR FROM TO_DATE(FECHA_DE_NACIMIENTO, 'MM/DD/YY')) - 100
                        ELSE EXTRACT(YEAR FROM TO_DATE(FECHA_DE_NACIMIENTO, 'MM/DD/YY'))
                    END) as age,
                    SEXO,
                    NOMBRE,
                    CENTRO_RECODIFICADO
                FROM DATOS_ORIGINALES 
                WHERE CATEGORIA = :diagnosis
                AND FECHA_DE_NACIMIENTO IS NOT NULL
                AND SEXO IN ('1', '2')
                AND NOMBRE IS NOT NULL
                AND CENTRO_RECODIFICADO IS NOT NULL
            ),
            grouped_data AS (
                SELECT 
                    CASE 
                        WHEN age BETWEEN 0 AND 9 THEN '0-9'
                        WHEN age BETWEEN 10 AND 19 THEN '10-19'
                        WHEN age BETWEEN 20 AND 29 THEN '20-29'
                        WHEN age BETWEEN 30 AND 39 THEN '30-39'
                        WHEN age BETWEEN 40 AND 49 THEN '40-49'
                        WHEN age BETWEEN 50 AND 59 THEN '50-59'
                        WHEN age BETWEEN 60 AND 69 THEN '60-69'
                        WHEN age BETWEEN 70 AND 79 THEN '70-79'
                        ELSE '80+'
                    END as grupo_edad,
                    SEXO,
                    COUNT(DISTINCT NOMBRE || '_' || CENTRO_RECODIFICADO) as count
                FROM age_calculations
                WHERE age >= 0
                GROUP BY 
                    CASE 
                        WHEN age BETWEEN 0 AND 9 THEN '0-9'
                        WHEN age BETWEEN 10 AND 19 THEN '10-19'
                        WHEN age BETWEEN 20 AND 29 THEN '20-29'
                        WHEN age BETWEEN 30 AND 39 THEN '30-39'
                        WHEN age BETWEEN 40 AND 49 THEN '40-49'
                        WHEN age BETWEEN 50 AND 59 THEN '50-59'
                        WHEN age BETWEEN 60 AND 69 THEN '60-69'
                        WHEN age BETWEEN 70 AND 79 THEN '70-79'
                        ELSE '80+'
                    END,
                    SEXO
            )
            SELECT grupo_edad, SEXO, count
            FROM grouped_data
            ORDER BY 
                CASE grupo_edad
                    WHEN '0-9' THEN 1
                    WHEN '10-19' THEN 2
                    WHEN '20-29' THEN 3
                    WHEN '30-39' THEN 4
                    WHEN '40-49' THEN 5
                    WHEN '50-59' THEN 6
                    WHEN '60-69' THEN 7
                    WHEN '70-79' THEN 8
                    ELSE 9
                END
            """
            
            cursor.execute(query, {"diagnosis": diagnosis})
            results = cursor.fetchall()
            
            # Crear diccionario para organizar datos por intervalo
            data_by_interval = {}
            
            # Inicializar todos los intervalos con 0 hombres y 0 mujeres
            for interval in age_groups:
                data_by_interval[interval] = {"hombres": 0, "mujeres": 0}
            
            # Procesar resultados de la consulta
            for grupo_edad, sexo, count in results:
                if grupo_edad in data_by_interval:
                    if sexo == '1':  # Hombre
                        data_by_interval[grupo_edad]["hombres"] = count
                    elif sexo == '2':  # Mujer
                        data_by_interval[grupo_edad]["mujeres"] = count
            
            # Convertir a lista de objetos con el formato solicitado
            result_list = []
            for interval in age_groups:
                result_list.append({
                    "intervalo": interval,
                    "hombres": data_by_interval[interval]["hombres"],
                    "mujeres": data_by_interval[interval]["mujeres"]
                })
            
            return result_list
            
        except Exception as e:
            print(f"Error en get_age_pyramid_data: {str(e)}")
            raise e
        finally:
            if connection:
                connection.close()

    def get_age_histogram_data(self, diagnosis: str) -> Dict[str, Any]:
        """
        Obtiene datos para histograma de distribución de edades
        """
        connection = None
        try:
            connection = self.get_connection()
            cursor = connection.cursor()
            
            # Definir grupos de edad más granulares para el histograma
            age_groups = ['0-9', '10-19', '20-29', '30-39', '40-49', '50-59', '60-69', '70-79', '80+']
            
            query = """
            SELECT 
                CASE 
                    WHEN 2024 - (CASE 
                        WHEN EXTRACT(YEAR FROM TO_DATE(FECHA_DE_NACIMIENTO, 'MM/DD/YY')) > 2025 
                        THEN EXTRACT(YEAR FROM TO_DATE(FECHA_DE_NACIMIENTO, 'MM/DD/YY')) - 100
                        ELSE EXTRACT(YEAR FROM TO_DATE(FECHA_DE_NACIMIENTO, 'MM/DD/YY'))
                    END) BETWEEN 0 AND 9 THEN '0-9'
                    WHEN 2024 - (CASE 
                        WHEN EXTRACT(YEAR FROM TO_DATE(FECHA_DE_NACIMIENTO, 'MM/DD/YY')) > 2025 
                        THEN EXTRACT(YEAR FROM TO_DATE(FECHA_DE_NACIMIENTO, 'MM/DD/YY')) - 100
                        ELSE EXTRACT(YEAR FROM TO_DATE(FECHA_DE_NACIMIENTO, 'MM/DD/YY'))
                    END) BETWEEN 10 AND 19 THEN '10-19'
                    WHEN 2024 - (CASE 
                        WHEN EXTRACT(YEAR FROM TO_DATE(FECHA_DE_NACIMIENTO, 'MM/DD/YY')) > 2025 
                        THEN EXTRACT(YEAR FROM TO_DATE(FECHA_DE_NACIMIENTO, 'MM/DD/YY')) - 100
                        ELSE EXTRACT(YEAR FROM TO_DATE(FECHA_DE_NACIMIENTO, 'MM/DD/YY'))
                    END) BETWEEN 20 AND 29 THEN '20-29'
                    WHEN 2024 - (CASE 
                        WHEN EXTRACT(YEAR FROM TO_DATE(FECHA_DE_NACIMIENTO, 'MM/DD/YY')) > 2025 
                        THEN EXTRACT(YEAR FROM TO_DATE(FECHA_DE_NACIMIENTO, 'MM/DD/YY')) - 100
                        ELSE EXTRACT(YEAR FROM TO_DATE(FECHA_DE_NACIMIENTO, 'MM/DD/YY'))
                    END) BETWEEN 30 AND 39 THEN '30-39'
                    WHEN 2024 - (CASE 
                        WHEN EXTRACT(YEAR FROM TO_DATE(FECHA_DE_NACIMIENTO, 'MM/DD/YY')) > 2025 
                        THEN EXTRACT(YEAR FROM TO_DATE(FECHA_DE_NACIMIENTO, 'MM/DD/YY')) - 100
                        ELSE EXTRACT(YEAR FROM TO_DATE(FECHA_DE_NACIMIENTO, 'MM/DD/YY'))
                    END) BETWEEN 40 AND 49 THEN '40-49'
                    WHEN 2024 - (CASE 
                        WHEN EXTRACT(YEAR FROM TO_DATE(FECHA_DE_NACIMIENTO, 'MM/DD/YY')) > 2025 
                        THEN EXTRACT(YEAR FROM TO_DATE(FECHA_DE_NACIMIENTO, 'MM/DD/YY')) - 100
                        ELSE EXTRACT(YEAR FROM TO_DATE(FECHA_DE_NACIMIENTO, 'MM/DD/YY'))
                    END) BETWEEN 50 AND 59 THEN '50-59'
                    WHEN 2024 - (CASE 
                        WHEN EXTRACT(YEAR FROM TO_DATE(FECHA_DE_NACIMIENTO, 'MM/DD/YY')) > 2025 
                        THEN EXTRACT(YEAR FROM TO_DATE(FECHA_DE_NACIMIENTO, 'MM/DD/YY')) - 100
                        ELSE EXTRACT(YEAR FROM TO_DATE(FECHA_DE_NACIMIENTO, 'MM/DD/YY'))
                    END) BETWEEN 60 AND 69 THEN '60-69'
                    WHEN 2024 - (CASE 
                        WHEN EXTRACT(YEAR FROM TO_DATE(FECHA_DE_NACIMIENTO, 'MM/DD/YY')) > 2025 
                        THEN EXTRACT(YEAR FROM TO_DATE(FECHA_DE_NACIMIENTO, 'MM/DD/YY')) - 100
                        ELSE EXTRACT(YEAR FROM TO_DATE(FECHA_DE_NACIMIENTO, 'MM/DD/YY'))
                    END) BETWEEN 70 AND 79 THEN '70-79'
                    ELSE '80+'
                END as grupo_edad,
                COUNT(DISTINCT NOMBRE || '_' || CENTRO_RECODIFICADO) as count
            FROM DATOS_ORIGINALES 
            WHERE CATEGORIA = :diagnosis
            AND FECHA_DE_NACIMIENTO IS NOT NULL
            GROUP BY 
                CASE 
                    WHEN 2024 - (CASE 
                        WHEN EXTRACT(YEAR FROM TO_DATE(FECHA_DE_NACIMIENTO, 'MM/DD/YY')) > 2025 
                        THEN EXTRACT(YEAR FROM TO_DATE(FECHA_DE_NACIMIENTO, 'MM/DD/YY')) - 100
                        ELSE EXTRACT(YEAR FROM TO_DATE(FECHA_DE_NACIMIENTO, 'MM/DD/YY'))
                    END) BETWEEN 0 AND 9 THEN '0-9'
                    WHEN 2024 - (CASE 
                        WHEN EXTRACT(YEAR FROM TO_DATE(FECHA_DE_NACIMIENTO, 'MM/DD/YY')) > 2025 
                        THEN EXTRACT(YEAR FROM TO_DATE(FECHA_DE_NACIMIENTO, 'MM/DD/YY')) - 100
                        ELSE EXTRACT(YEAR FROM TO_DATE(FECHA_DE_NACIMIENTO, 'MM/DD/YY'))
                    END) BETWEEN 10 AND 19 THEN '10-19'
                    WHEN 2024 - (CASE 
                        WHEN EXTRACT(YEAR FROM TO_DATE(FECHA_DE_NACIMIENTO, 'MM/DD/YY')) > 2025 
                        THEN EXTRACT(YEAR FROM TO_DATE(FECHA_DE_NACIMIENTO, 'MM/DD/YY')) - 100
                        ELSE EXTRACT(YEAR FROM TO_DATE(FECHA_DE_NACIMIENTO, 'MM/DD/YY'))
                    END) BETWEEN 20 AND 29 THEN '20-29'
                    WHEN 2024 - (CASE 
                        WHEN EXTRACT(YEAR FROM TO_DATE(FECHA_DE_NACIMIENTO, 'MM/DD/YY')) > 2025 
                        THEN EXTRACT(YEAR FROM TO_DATE(FECHA_DE_NACIMIENTO, 'MM/DD/YY')) - 100
                        ELSE EXTRACT(YEAR FROM TO_DATE(FECHA_DE_NACIMIENTO, 'MM/DD/YY'))
                    END) BETWEEN 30 AND 39 THEN '30-39'
                    WHEN 2024 - (CASE 
                        WHEN EXTRACT(YEAR FROM TO_DATE(FECHA_DE_NACIMIENTO, 'MM/DD/YY')) > 2025 
                        THEN EXTRACT(YEAR FROM TO_DATE(FECHA_DE_NACIMIENTO, 'MM/DD/YY')) - 100
                        ELSE EXTRACT(YEAR FROM TO_DATE(FECHA_DE_NACIMIENTO, 'MM/DD/YY'))
                    END) BETWEEN 40 AND 49 THEN '40-49'
                    WHEN 2024 - (CASE 
                        WHEN EXTRACT(YEAR FROM TO_DATE(FECHA_DE_NACIMIENTO, 'MM/DD/YY')) > 2025 
                        THEN EXTRACT(YEAR FROM TO_DATE(FECHA_DE_NACIMIENTO, 'MM/DD/YY')) - 100
                        ELSE EXTRACT(YEAR FROM TO_DATE(FECHA_DE_NACIMIENTO, 'MM/DD/YY'))
                    END) BETWEEN 50 AND 59 THEN '50-59'
                    WHEN 2024 - (CASE 
                        WHEN EXTRACT(YEAR FROM TO_DATE(FECHA_DE_NACIMIENTO, 'MM/DD/YY')) > 2025 
                        THEN EXTRACT(YEAR FROM TO_DATE(FECHA_DE_NACIMIENTO, 'MM/DD/YY')) - 100
                        ELSE EXTRACT(YEAR FROM TO_DATE(FECHA_DE_NACIMIENTO, 'MM/DD/YY'))
                    END) BETWEEN 60 AND 69 THEN '60-69'
                    WHEN 2024 - (CASE 
                        WHEN EXTRACT(YEAR FROM TO_DATE(FECHA_DE_NACIMIENTO, 'MM/DD/YY')) > 2025 
                        THEN EXTRACT(YEAR FROM TO_DATE(FECHA_DE_NACIMIENTO, 'MM/DD/YY')) - 100
                        ELSE EXTRACT(YEAR FROM TO_DATE(FECHA_DE_NACIMIENTO, 'MM/DD/YY'))
                    END) BETWEEN 70 AND 79 THEN '70-79'
                    ELSE '80+'
                END
            """
            
            cursor.execute(query, {"diagnosis": diagnosis})
            results = cursor.fetchall()
            
            # Organizar datos
            counts = [0] * len(age_groups)
            
            for grupo_edad, count in results:
                if grupo_edad in age_groups:
                    group_index = age_groups.index(grupo_edad)
                    counts[group_index] = count
            
            return {
                "age_groups": age_groups,
                "counts": counts,
                "diagnosis": diagnosis
            }
            
        except Exception as e:
            print(f"Error en get_age_histogram_data: {str(e)}")
            raise e
        finally:
            if connection:
                connection.close()
    
    def get_gender_distribution_data(self, diagnosis: str) -> Dict[str, Any]:
        """
        Obtiene datos para distribución por sexo
        """
        connection = None
        try:
            connection = self.get_connection()
            cursor = connection.cursor()
            
            query = """
            SELECT 
                CASE 
                    WHEN SEXO = '1' THEN 'M'
                    WHEN SEXO = '2' THEN 'F'
                    ELSE 'Otros'
                END as sexo,
                COUNT(DISTINCT NOMBRE || '_' || CENTRO_RECODIFICADO) as count
            FROM DATOS_ORIGINALES 
            WHERE CATEGORIA = :diagnosis
            AND FECHA_DE_NACIMIENTO IS NOT NULL
            GROUP BY 
                CASE 
                    WHEN SEXO = '1' THEN 'M'
                    WHEN SEXO = '2' THEN 'F'
                    ELSE 'Otros'
                END
            """
            
            cursor.execute(query, {"diagnosis": diagnosis})
            results = cursor.fetchall()
            
            male_count = 0
            female_count = 0
            
            for sexo, count in results:
                if sexo == 'M':
                    male_count = count
                elif sexo == 'F':
                    female_count = count
            
            return {
                "male_count": male_count,
                "female_count": female_count,
                "total": male_count + female_count,
                "diagnosis": diagnosis
            }
            
        except Exception as e:
            print(f"Error en get_gender_distribution_data: {str(e)}")
            raise e
        finally:
            if connection:
                connection.close()
    
    def get_pie_chart_data(self, diagnosis: str) -> Dict[str, int]:
        """
        Obtiene datos para diagrama de sectores por sexo
        Devuelve formato: {"Hombres": int, "Mujeres": int}
        """
        connection = None
        try:
            connection = self.get_connection()
            cursor = connection.cursor()
            
            query = """
            SELECT 
                SEXO,
                COUNT(DISTINCT NOMBRE || '_' || CENTRO_RECODIFICADO) as count
            FROM DATOS_ORIGINALES 
            WHERE CATEGORIA = :diagnosis
            AND SEXO IN ('1', '2')
            AND NOMBRE IS NOT NULL
            AND CENTRO_RECODIFICADO IS NOT NULL
            GROUP BY SEXO
            """
            
            cursor.execute(query, {"diagnosis": diagnosis})
            results = cursor.fetchall()
            
            # Inicializar diccionario con valores por defecto
            pie_data = {
                "Hombres": 0,
                "Mujeres": 0
            }
            
            # Procesar resultados
            for sexo, count in results:
                if sexo == '1':  # Hombre
                    pie_data["Hombres"] = count
                elif sexo == '2':  # Mujer
                    pie_data["Mujeres"] = count
            
            return pie_data
            
        except Exception as e:
            print(f"Error en get_pie_chart_data: {str(e)}")
            raise e
        finally:
            if connection:
                connection.close()