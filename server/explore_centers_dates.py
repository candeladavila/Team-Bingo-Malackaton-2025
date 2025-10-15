"""
Script para explorar campos relacionados con centros y fechas en DATOS_ORIGINALES
"""

import oracledb
import os
from dotenv import load_dotenv

# Cargar variables de entorno
dotenv_path = os.path.join(os.path.dirname(__file__), '.env')
load_dotenv(dotenv_path)

def get_connection():
    """Establece conexión con la base de datos Oracle"""
    wallet_path = os.getenv("WALLET_PATH")
    wallet_password = os.getenv("WALLET_PASSWORD")
    user = os.getenv("DB_USER")
    user_password = os.getenv("DB_PASSWORD")
    dsn = os.getenv("DB_TNS_ALIAS")

    # Si wallet_path contiene ${PWD}, reemplazarlo
    if wallet_path and "${PWD}" in wallet_path:
        current_dir = os.path.dirname(__file__)
        wallet_path = wallet_path.replace("${PWD}", current_dir)

    return oracledb.connect(
        user=user,
        password=user_password,
        dsn=dsn,
        config_dir=wallet_path,
        wallet_location=wallet_path,
        wallet_password=wallet_password
    )

def explore_center_and_date_fields():
    """Explora campos relacionados con centros y fechas"""
    connection = get_connection()
    cursor = connection.cursor()
    
    try:
        print("🔍 EXPLORANDO CAMPOS DE CENTROS Y FECHAS")
        print("=" * 50)
        
        # Buscar campos relacionados con centros
        print("\n📋 CAMPOS RELACIONADOS CON CENTROS:")
        print("-" * 40)
        
        center_fields = [
            'CENTRO_RECODIFICADO',
            'SERVICIO',
            'CIP_SNS_RECODIFICADO'
        ]
        
        for field in center_fields:
            try:
                cursor.execute(f"""
                    SELECT COUNT(DISTINCT {field}) as distinct_count,
                           COUNT(*) as total_count,
                           COUNT(CASE WHEN {field} IS NOT NULL THEN 1 END) as non_null_count
                    FROM DATOS_ORIGINALES
                """)
                result = cursor.fetchone()
                distinct_count, total_count, non_null_count = result
                
                print(f"  {field}:")
                print(f"    - Total registros: {total_count}")
                print(f"    - Registros no nulos: {non_null_count}")
                print(f"    - Valores únicos: {distinct_count}")
                
                # Mostrar algunos valores únicos
                if distinct_count > 0 and distinct_count <= 20:
                    cursor.execute(f"""
                        SELECT DISTINCT {field} 
                        FROM DATOS_ORIGINALES 
                        WHERE {field} IS NOT NULL 
                        AND ROWNUM <= 10
                        ORDER BY {field}
                    """)
                    sample_values = cursor.fetchall()
                    print(f"    - Ejemplos: {[row[0] for row in sample_values]}")
                
            except Exception as e:
                print(f"  {field}: Error - {str(e)}")
        
        # Buscar campos relacionados con fechas
        print("\n📅 CAMPOS RELACIONADOS CON FECHAS:")
        print("-" * 40)
        
        date_fields = [
            'FECHA_DE_INGRESO',
            'FECHA_DE_FIN_CONTACTO',
            'FECHA_DE_INICIO_CONTACTO',
            'FECHA_DE_INTERVENCION'
        ]
        
        for field in date_fields:
            try:
                cursor.execute(f"""
                    SELECT COUNT(*) as total_count,
                           COUNT(CASE WHEN {field} IS NOT NULL THEN 1 END) as non_null_count
                    FROM DATOS_ORIGINALES
                """)
                result = cursor.fetchone()
                total_count, non_null_count = result
                
                print(f"  {field}:")
                print(f"    - Total registros: {total_count}")
                print(f"    - Registros no nulos: {non_null_count}")
                
                # Mostrar algunos valores de ejemplo
                if non_null_count > 0:
                    cursor.execute(f"""
                        SELECT {field}
                        FROM DATOS_ORIGINALES 
                        WHERE {field} IS NOT NULL 
                        AND ROWNUM <= 5
                    """)
                    sample_values = cursor.fetchall()
                    print(f"    - Ejemplos: {[row[0] for row in sample_values]}")
                
            except Exception as e:
                print(f"  {field}: Error - {str(e)}")
        
        # Buscar otros campos que podrían ser útiles
        print("\n🏥 OTROS CAMPOS POTENCIALMENTE ÚTILES:")
        print("-" * 40)
        
        other_fields = [
            'ESTANCIA_DIAS',
            'TIPO_ALTA',
            'CIRCUNSTANCIA_DE_CONTACTO'
        ]
        
        for field in other_fields:
            try:
                cursor.execute(f"""
                    SELECT COUNT(DISTINCT {field}) as distinct_count,
                           COUNT(CASE WHEN {field} IS NOT NULL THEN 1 END) as non_null_count
                    FROM DATOS_ORIGINALES
                """)
                result = cursor.fetchone()
                distinct_count, non_null_count = result
                
                print(f"  {field}:")
                print(f"    - Registros no nulos: {non_null_count}")
                print(f"    - Valores únicos: {distinct_count}")
                
                # Mostrar algunos valores únicos
                if distinct_count > 0 and distinct_count <= 15:
                    cursor.execute(f"""
                        SELECT DISTINCT {field} 
                        FROM DATOS_ORIGINALES 
                        WHERE {field} IS NOT NULL 
                        AND ROWNUM <= 10
                        ORDER BY {field}
                    """)
                    sample_values = cursor.fetchall()
                    print(f"    - Ejemplos: {[row[0] for row in sample_values]}")
                
            except Exception as e:
                print(f"  {field}: Error - {str(e)}")
        
        # Mostrar una muestra completa de datos
        print("\n📋 MUESTRA DE DATOS COMPLETOS:")
        print("-" * 40)
        cursor.execute("""
            SELECT NOMBRE, CENTRO_RECODIFICADO, SERVICIO, FECHA_DE_INGRESO, 
                   FECHA_DE_FIN_CONTACTO, ESTANCIA_DIAS, TIPO_ALTA
            FROM DATOS_ORIGINALES 
            WHERE ROWNUM <= 3
        """)
        
        rows = cursor.fetchall()
        for i, row in enumerate(rows, 1):
            print(f"  Registro {i}:")
            print(f"    Nombre: {row[0]}")
            print(f"    Centro: {row[1]}")
            print(f"    Servicio: {row[2]}")
            print(f"    Fecha Ingreso: {row[3]}")
            print(f"    Fecha Fin: {row[4]}")
            print(f"    Estancia (días): {row[5]}")
            print(f"    Tipo Alta: {row[6]}")
            print()
        
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        import traceback
        traceback.print_exc()
        
    finally:
        cursor.close()
        connection.close()

if __name__ == "__main__":
    explore_center_and_date_fields()