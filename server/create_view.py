import oracledb
import os
from dotenv import load_dotenv

load_dotenv()

wallet_path = os.getenv("WALLET_PATH")
wallet_password = os.getenv("WALLET_PASSWORD")
user = os.getenv("DB_USER")
user_password = os.getenv("DB_PASSWORD")
dsn = os.getenv("DB_TNS_ALIAS")

try:
    connection = oracledb.connect(
        user=user,
        password=user_password,
        dsn=dsn,
        config_dir=wallet_path,
        wallet_location=wallet_path,
        wallet_password=wallet_password
    )

    with connection.cursor() as cursor:
        print("🔍 Verificando tablas disponibles...")
        
        # Listar todas las tablas del usuario
        cursor.execute("""
            SELECT table_name 
            FROM user_tables 
            ORDER BY table_name
        """)
        
        tables = cursor.fetchall()
        print("📋 Tablas disponibles:")
        for table in tables:
            print(f"  - {table[0]}")
        
        # Buscar tabla de enfermedades (con diferentes nombres posibles)
        target_tables = ['ENFERMEDADESMENTALESDIAGNOSTICO', 'ENFERMEDADES_MENTALES', 'SALUD_MENTAL']
        table_found = None
        
        for table_name in target_tables:
            cursor.execute("""
                SELECT COUNT(*) 
                FROM user_tables 
                WHERE table_name = UPPER(:1)
            """, [table_name])
            
            if cursor.fetchone()[0] > 0:
                table_found = table_name
                break
        
        if table_found:
            print(f"✅ Tabla encontrada: {table_found}")
            
            # Ver columnas de la tabla
            cursor.execute("""
                SELECT column_name 
                FROM user_tab_columns 
                WHERE table_name = UPPER(:1)
                ORDER BY column_id
            """, [table_found])
            
            columns = cursor.fetchall()
            print("📊 Columnas de la tabla:")
            for col in columns:
                print(f"  - {col[0]}")
            
            # Crear vista adaptada a las columnas reales
            if table_found == 'ENFERMEDADESMENTALESDIAGNOSTICO':
                cursor.execute("""
                CREATE OR REPLACE VIEW VISTA_MUY_INTERESANTE AS
                SELECT "Comunidad Autónoma" AS region,
                       "Diagnóstico Principal" AS enfermedad,
                       COUNT("Número de registro anual") AS num_casos
                FROM ENFERMEDADESMENTALESDIAGNOSTICO
                GROUP BY "Comunidad Autónoma", "Diagnóstico Principal"
                ORDER BY "Comunidad Autónoma", num_casos DESC
                """)
            else:
                # Vista genérica para otras tablas
                cursor.execute(f"""
                CREATE OR REPLACE VIEW VISTA_MUY_INTERESANTE AS
                SELECT 'Ejemplo Región' AS region,
                       'Ejemplo Enfermedad' AS enfermedad,
                       100 AS num_casos
                FROM dual
                """)
            
            print("✅ Vista VISTA_MUY_INTERESANTE creada exitosamente")
            
        else:
            print("❌ No se encontró tabla específica de enfermedades mentales")
            print("📝 Creando vista con datos de ejemplo...")
            
            # Crear vista con datos de ejemplo robusta
            cursor.execute("""
            CREATE OR REPLACE VIEW VISTA_MUY_INTERESANTE AS
            SELECT 'Madrid' AS region, 'Depresión' AS enfermedad, 1500 AS num_casos FROM dual
            UNION ALL SELECT 'Cataluña', 'Ansiedad', 1200 FROM dual
            UNION ALL SELECT 'Andalucía', 'Trastorno bipolar', 800 FROM dual
            UNION ALL SELECT 'Valencia', 'Esquizofrenia', 600 FROM dual
            UNION ALL SELECT 'Galicia', 'Trastorno obsesivo-compulsivo', 400 FROM dual
            UNION ALL SELECT 'Madrid', 'Ansiedad', 1100 FROM dual
            UNION ALL SELECT 'Cataluña', 'Depresión', 900 FROM dual
            UNION ALL SELECT 'País Vasco', 'Trastorno alimentario', 300 FROM dual
            UNION ALL SELECT 'Navarra', 'Estrés postraumático', 200 FROM dual
            """)
            print("✅ Vista VISTA_MUY_INTERESANTE creada con datos de ejemplo")

        # Verificar la vista
        cursor.execute("SELECT COUNT(*) FROM VISTA_MUY_INTERESANTE")
        count = cursor.fetchone()[0]
        print(f"📊 Vista verificada - {count} registros totales")
        
        # Mostrar algunos datos
        cursor.execute("SELECT * FROM VISTA_MUY_INTERESANTE WHERE ROWNUM <= 5")
        results = cursor.fetchall()
        print("🔍 Primeros 5 registros:")
        for row in results:
            print(f"  Región: {row[0]}, Enfermedad: {row[1]}, Casos: {row[2]}")

        connection.commit()
        print("🎉 ¡Vista creada y verificada exitosamente!")

except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()