"""
Script para explorar específicamente la tabla PACIENTES
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

    return oracledb.connect(
        user=user,
        password=user_password,
        dsn=dsn,
        config_dir=wallet_path,
        wallet_location=wallet_path,
        wallet_password=wallet_password
    )

def explore_pacientes_table():
    """Explora la tabla PACIENTES específicamente"""
    connection = get_connection()
    cursor = connection.cursor()
    
    try:
        print("🔍 EXPLORANDO TABLA PACIENTES")
        print("=" * 50)
        
        # Obtener estructura de la tabla PACIENTES
        cursor.execute("""
            SELECT column_name, data_type, data_length, nullable
            FROM user_tab_columns 
            WHERE table_name = 'PACIENTES'
            ORDER BY column_id
        """)
        
        columns = cursor.fetchall()
        print("\n📄 Estructura de PACIENTES:")
        print("-" * 30)
        for col in columns:
            nullable = "NULL" if col[3] == "Y" else "NOT NULL"
            print(f"  • {col[0]} - {col[1]}({col[2]}) - {nullable}")
        
        # Contar registros
        cursor.execute("SELECT COUNT(*) FROM PACIENTES")
        count = cursor.fetchone()[0]
        print(f"\n📊 Total de registros: {count}")
        
        # Muestra de datos
        print(f"\n📋 Muestra de datos (primeras 5 filas):")
        print("-" * 40)
        cursor.execute("SELECT * FROM PACIENTES WHERE ROWNUM <= 5")
        rows = cursor.fetchall()
        
        for i, row in enumerate(rows, 1):
            print(f"\nFila {i}:")
            for j, col in enumerate(columns):
                print(f"  {col[0]}: {row[j]}")
        
        # Analizar campos útiles para filtrado
        print(f"\n🎯 ANÁLISIS PARA FILTRADO:")
        print("-" * 30)
        
        # Verificar si existen campos relacionados con lo que necesitamos
        fields_to_check = [
            ('COMUNIDAD_AUTONOMA', 'comunidades autónomas'),
            ('CCAA_RESIDENCIA', 'comunidades de residencia'),
            ('FECHA_DE_NACIMIENTO', 'fechas de nacimiento'),
            ('EDAD', 'edad'),
            ('SEXO', 'sexo'),
            ('DIAGNOSTICO_PRINCIPAL', 'diagnóstico principal'),
            ('CATEGORIA', 'categoría diagnóstica')
        ]
        
        for field, description in fields_to_check:
            try:
                cursor.execute(f"SELECT COUNT(DISTINCT {field}) FROM PACIENTES WHERE {field} IS NOT NULL")
                distinct_count = cursor.fetchone()[0]
                
                cursor.execute(f"SELECT COUNT(*) FROM PACIENTES WHERE {field} IS NOT NULL")
                non_null_count = cursor.fetchone()[0]
                
                print(f"  {field}:")
                print(f"    - Valores únicos: {distinct_count}")
                print(f"    - Registros no nulos: {non_null_count}")
                
                # Mostrar algunos valores únicos
                if distinct_count > 0 and distinct_count <= 20:
                    cursor.execute(f"SELECT DISTINCT {field} FROM PACIENTES WHERE {field} IS NOT NULL AND ROWNUM <= 10")
                    sample_values = cursor.fetchall()
                    print(f"    - Ejemplos: {[row[0] for row in sample_values]}")
                
            except Exception as e:
                print(f"  {field}: Error al consultar - {str(e)}")
        
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        
    finally:
        cursor.close()
        connection.close()

if __name__ == "__main__":
    explore_pacientes_table()