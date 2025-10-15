"""
Servicios para el filtrado de datos de pacientes
"""
from typing import List, Dict, Any, Tuple
import oracledb
import os
from dotenv import load_dotenv

# Cargar variables de entorno
dotenv_path = os.path.join(os.path.dirname(__file__), '.env')
load_dotenv(dotenv_path)

class PatientFilterService:
    """Servicio para filtrar datos de pacientes"""
    
    def __init__(self):
        # Cargar variables de entorno aquí también
        dotenv_path = os.path.join(os.path.dirname(__file__), '..', '.env')
        load_dotenv(dotenv_path)
        
        self.wallet_path = os.getenv("WALLET_PATH")
        
        # Si wallet_path contiene ${PWD}, reemplazarlo con el directorio actual
        if self.wallet_path and "${PWD}" in self.wallet_path:
            current_dir = os.path.dirname(os.path.dirname(__file__))  # Subir un nivel desde services/
            self.wallet_path = self.wallet_path.replace("${PWD}", current_dir)
        
        self.wallet_password = os.getenv("WALLET_PASSWORD")
        self.user = os.getenv("DB_USER")
        self.user_password = os.getenv("DB_PASSWORD")
        self.dsn = os.getenv("DB_TNS_ALIAS")
        
        # Debug: mostrar las credenciales (sin password)
        print(f"🔑 Configuración de DB:")
        print(f"   Usuario: {self.user}")
        print(f"   DSN: {self.dsn}")
        print(f"   Wallet Path: {self.wallet_path}")
        print(f"   Wallet Password: {'***' if self.wallet_password else 'No configurado'}")
    
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
    
    def build_filter_conditions(self, filters: Dict[str, Any]) -> Tuple[List[str], Dict[str, Any]]:
        """
        Construye las condiciones SQL y parámetros basados en los filtros
        
        Args:
            filters: Diccionario con los filtros a aplicar
            
        Returns:
            Tuple con lista de condiciones SQL y diccionario de parámetros
        """
        conditions = []
        params = {}
        
        # Filtro por comunidades autónomas
        if filters.get('comunidades') and len(filters['comunidades']) > 0:
            placeholders = []
            for i, comunidad in enumerate(filters['comunidades']):
                param_name = f"comunidad_{i}"
                placeholders.append(f":{param_name}")
                params[param_name] = comunidad
            conditions.append(f"UPPER(COMUNIDAD_AUTONOMA) IN ({','.join(f'UPPER({p})' for p in placeholders)})")
        
        # Filtro por año de nacimiento - necesitamos extraer el año de FECHA_DE_NACIMIENTO
        # y corregir para años de 2 dígitos (convertir 20xx a 19xx si es mayor a año actual)
        if filters.get('año_nacimiento_min') is not None:
            conditions.append("""
                CASE 
                    WHEN EXTRACT(YEAR FROM TO_DATE(FECHA_DE_NACIMIENTO, 'MM/DD/YY')) > 2025 
                    THEN EXTRACT(YEAR FROM TO_DATE(FECHA_DE_NACIMIENTO, 'MM/DD/YY')) - 100
                    ELSE EXTRACT(YEAR FROM TO_DATE(FECHA_DE_NACIMIENTO, 'MM/DD/YY'))
                END >= :año_min
            """)
            params["año_min"] = filters['año_nacimiento_min']
        
        if filters.get('año_nacimiento_max') is not None:
            conditions.append("""
                CASE 
                    WHEN EXTRACT(YEAR FROM TO_DATE(FECHA_DE_NACIMIENTO, 'MM/DD/YY')) > 2025 
                    THEN EXTRACT(YEAR FROM TO_DATE(FECHA_DE_NACIMIENTO, 'MM/DD/YY')) - 100
                    ELSE EXTRACT(YEAR FROM TO_DATE(FECHA_DE_NACIMIENTO, 'MM/DD/YY'))
                END <= :año_max
            """)
            params["año_max"] = filters['año_nacimiento_max']
        
        # Filtro por sexo (1=Hombre, 2=Mujer, según los datos)
        if filters.get('sexo') and len(filters['sexo']) > 0:
            sexo_codes = []
            for sexo in filters['sexo']:
                if sexo.lower() == 'hombre':
                    sexo_codes.append('1')
                elif sexo.lower() == 'mujer':
                    sexo_codes.append('2')
                else:  # Otros
                    sexo_codes.append('3')
            
            if sexo_codes:
                placeholders = []
                for i, code in enumerate(sexo_codes):
                    param_name = f"sexo_{i}"
                    placeholders.append(f":{param_name}")
                    params[param_name] = code
                conditions.append(f"SEXO IN ({','.join(placeholders)})")
        
        # Filtro por diagnósticos - usar CATEGORIA que contiene el diagnóstico agrupado
        if filters.get('diagnosticos') and len(filters['diagnosticos']) > 0:
            placeholders = []
            for i, diagnostico in enumerate(filters['diagnosticos']):
                param_name = f"diagnostico_{i}"
                placeholders.append(f":{param_name}")
                params[param_name] = diagnostico
            conditions.append(f"CATEGORIA IN ({','.join(placeholders)})")
        
        # Filtro por centros
        if filters.get('centros') and len(filters['centros']) > 0:
            placeholders = []
            for i, centro in enumerate(filters['centros']):
                param_name = f"centro_{i}"
                placeholders.append(f":{param_name}")
                params[param_name] = centro
            conditions.append(f"CENTRO_RECODIFICADO IN ({','.join(placeholders)})")
        
        return conditions, params
    
    def get_filtered_patients(self, filters: Dict[str, Any], page: int = 1, rows_per_page: int = 20) -> Dict[str, Any]:
        """
        Obtiene pacientes filtrados con paginación
        
        Args:
            filters: Filtros a aplicar
            page: Número de página
            rows_per_page: Filas por página
            
        Returns:
            Diccionario con datos paginados y metadatos
        """
        connection = self.get_connection()
        cursor = connection.cursor()
        
        try:
            # Construir condiciones de filtro
            conditions, params = self.build_filter_conditions(filters)
            
            # Consulta base usando DATOS_ORIGINALES
            base_query = """
            SELECT 
                ROWNUM as id,
                NOMBRE,
                COMUNIDAD_AUTONOMA,
                CASE 
                    WHEN EXTRACT(YEAR FROM TO_DATE(FECHA_DE_NACIMIENTO, 'MM/DD/YY')) > 2025 
                    THEN EXTRACT(YEAR FROM TO_DATE(FECHA_DE_NACIMIENTO, 'MM/DD/YY')) - 100
                    ELSE EXTRACT(YEAR FROM TO_DATE(FECHA_DE_NACIMIENTO, 'MM/DD/YY'))
                END as año_nacimiento,
                CASE 
                    WHEN SEXO = '1' THEN 'Hombre'
                    WHEN SEXO = '2' THEN 'Mujer'
                    ELSE 'Otros'
                END as sexo,
                CATEGORIA as diagnostico,
                CENTRO_RECODIFICADO as centro,
                FECHA_DE_INGRESO as fecha_ingreso,
                FECHA_DE_FIN_CONTACTO as fecha_fin_contacto,
                ESTANCIA_DIAS as estancia_dias
            FROM DATOS_ORIGINALES
            WHERE FECHA_DE_NACIMIENTO IS NOT NULL 
            AND COMUNIDAD_AUTONOMA IS NOT NULL
            AND CATEGORIA IS NOT NULL
            AND CENTRO_RECODIFICADO IS NOT NULL
            """
            
            if conditions:
                base_query += " AND " + " AND ".join(conditions)
            
            # Contar total de registros
            count_query = f"SELECT COUNT(*) FROM ({base_query})"
            cursor.execute(count_query, params)
            total_records = cursor.fetchone()[0]
            
            # Calcular paginación
            total_pages = (total_records + rows_per_page - 1) // rows_per_page
            offset = (page - 1) * rows_per_page
            
            # Consulta con paginación usando ROWNUM
            paginated_query = f"""
            SELECT * FROM (
                SELECT ROWNUM AS rn, t.* FROM (
                    {base_query}
                    ORDER BY NOMBRE
                ) t
                WHERE ROWNUM <= :end_row
            )
            WHERE rn > :start_row
            """
            
            params["start_row"] = offset
            params["end_row"] = offset + rows_per_page
            
            cursor.execute(paginated_query, params)
            rows = cursor.fetchall()
            
            # Convertir resultados
            patients = []
            for row in rows:
                # Saltamos el primer campo que es ROWNUM (rn) de la paginación
                patient = {
                    "id": row[1],  # id original
                    "nombre": row[2],  # NOMBRE
                    "comunidad": row[3],  # COMUNIDAD_AUTONOMA
                    "año_nacimiento": row[4],  # año_nacimiento calculado
                    "sexo": row[5],  # sexo convertido
                    "diagnostico": row[6],  # CATEGORIA
                    "centro": row[7],  # CENTRO_RECODIFICADO
                    "fecha_ingreso": row[8],  # FECHA_DE_INGRESO
                    "fecha_fin_contacto": row[9],  # FECHA_DE_FIN_CONTACTO
                    "estancia_dias": int(row[10]) if row[10] else 0  # ESTANCIA_DIAS
                }
                patients.append(patient)
            
            return {
                "data": patients,
                "total_records": total_records,
                "current_page": page,
                "total_pages": total_pages,
                "rows_per_page": rows_per_page
            }
            
        finally:
            cursor.close()
            connection.close()
    
    def get_filter_options(self) -> Dict[str, Any]:
        """
        Obtiene las opciones disponibles para todos los filtros
        
        Returns:
            Diccionario con opciones de filtro disponibles
        """
        connection = self.get_connection()
        cursor = connection.cursor()
        
        try:
            # Obtener comunidades autónomas únicas
            cursor.execute("""
                SELECT DISTINCT COMUNIDAD_AUTONOMA 
                FROM DATOS_ORIGINALES 
                WHERE COMUNIDAD_AUTONOMA IS NOT NULL 
                ORDER BY COMUNIDAD_AUTONOMA
            """)
            comunidades = [row[0] for row in cursor.fetchall()]
            
            # Obtener sexos únicos (convertir códigos a texto)
            sexos = ['Hombre', 'Mujer', 'Otros']
            
            # Obtener diagnósticos únicos (usar CATEGORIA)
            cursor.execute("""
                SELECT DISTINCT CATEGORIA 
                FROM DATOS_ORIGINALES 
                WHERE CATEGORIA IS NOT NULL 
                ORDER BY CATEGORIA
            """)
            diagnosticos = [row[0] for row in cursor.fetchall()]
            
            # Obtener rango de años de nacimiento
            cursor.execute("""
                SELECT 
                    MIN(CASE 
                        WHEN EXTRACT(YEAR FROM TO_DATE(FECHA_DE_NACIMIENTO, 'MM/DD/YY')) > 2025 
                        THEN EXTRACT(YEAR FROM TO_DATE(FECHA_DE_NACIMIENTO, 'MM/DD/YY')) - 100
                        ELSE EXTRACT(YEAR FROM TO_DATE(FECHA_DE_NACIMIENTO, 'MM/DD/YY'))
                    END), 
                    MAX(CASE 
                        WHEN EXTRACT(YEAR FROM TO_DATE(FECHA_DE_NACIMIENTO, 'MM/DD/YY')) > 2025 
                        THEN EXTRACT(YEAR FROM TO_DATE(FECHA_DE_NACIMIENTO, 'MM/DD/YY')) - 100
                        ELSE EXTRACT(YEAR FROM TO_DATE(FECHA_DE_NACIMIENTO, 'MM/DD/YY'))
                    END)
                FROM DATOS_ORIGINALES 
                WHERE FECHA_DE_NACIMIENTO IS NOT NULL
            """)
            result = cursor.fetchone()
            año_min, año_max = result if result else (1950, 2005)
            
            # Obtener centros únicos
            cursor.execute("""
                SELECT DISTINCT CENTRO_RECODIFICADO 
                FROM DATOS_ORIGINALES 
                WHERE CENTRO_RECODIFICADO IS NOT NULL 
                ORDER BY CENTRO_RECODIFICADO
            """)
            centros = [row[0] for row in cursor.fetchall()]
            
            return {
                "comunidades": comunidades,
                "sexos": sexos,
                "diagnosticos": diagnosticos,
                "centros": centros,
                "año_nacimiento_range": {
                    "min": int(año_min) if año_min else 1950,
                    "max": int(año_max) if año_max else 2005
                }
            }
            
        finally:
            cursor.close()
            connection.close()