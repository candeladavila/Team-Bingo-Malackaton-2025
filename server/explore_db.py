"""
Script para explorar la estructura de la base de datos Oracle
y adaptar el sistema de filtrado a las tablas existentes
"""

import oracledb
import os
from dotenv import load_dotenv

# Cargar variables de entorno
dotenv_path = os.path.join(os.path.dirname(__file__), '.env')
load_dotenv(dotenv_path)

def get_connection():
    """Establece conexión con la base de datos Oracle"""
    try:
        wallet_path = os.getenv("WALLET_PATH")
        wallet_password = os.getenv("WALLET_PASSWORD")
        user = os.getenv("DB_USER")
        user_password = os.getenv("DB_PASSWORD")
        dsn = os.getenv("DB_TNS_ALIAS")

        print(f"Conectando con usuario: {user}")
        print(f"DSN: {dsn}")
        print(f"Wallet path: {wallet_path}")

        connection = oracledb.connect(
            user=user,
            password=user_password,
            dsn=dsn,
            config_dir=wallet_path,
            wallet_location=wallet_path,
            wallet_password=wallet_password
        )
        
        print("✅ Conexión exitosa a Oracle Database")
        return connection
        
    except Exception as e:
        print(f"❌ Error de conexión: {str(e)}")
        return None

def explore_database():
    """Explora la estructura de la base de datos"""
    connection = get_connection()
    
    if not connection:
        return
    
    cursor = connection.cursor()
    
    try:
        print("\n" + "="*60)
        print("EXPLORANDO ESTRUCTURA DE LA BASE DE DATOS")
        print("="*60)
        
        # Listar todas las tablas del usuario
        print("\n📋 TABLAS DISPONIBLES:")
        print("-" * 30)
        cursor.execute("""
            SELECT table_name 
            FROM user_tables 
            ORDER BY table_name
        """)
        
        tables = cursor.fetchall()
        if tables:
            for table in tables:
                print(f"  • {table[0]}")
        else:
            print("  No se encontraron tablas del usuario")
            
        # Si hay tablas, explorar las primeras
        if tables:
            print(f"\n🔍 EXPLORANDO ESTRUCTURA DE LAS PRIMERAS TABLAS:")
            print("-" * 50)
            
            for table in tables[:5]:  # Solo las primeras 5 tablas
                table_name = table[0]
                print(f"\n📄 Tabla: {table_name}")
                
                # Obtener columnas de la tabla
                cursor.execute("""
                    SELECT column_name, data_type, data_length, nullable
                    FROM user_tab_columns 
                    WHERE table_name = :table_name
                    ORDER BY column_id
                """, {"table_name": table_name})
                
                columns = cursor.fetchall()
                if columns:
                    print("   Columnas:")
                    for col in columns:
                        nullable = "NULL" if col[3] == "Y" else "NOT NULL"
                        print(f"     • {col[0]} - {col[1]}({col[2]}) - {nullable}")
                    
                    # Obtener una muestra de datos
                    try:
                        cursor.execute(f"SELECT COUNT(*) FROM {table_name}")
                        count = cursor.fetchone()[0]
                        print(f"   Registros: {count}")
                        
                        if count > 0:
                            cursor.execute(f"SELECT * FROM {table_name} WHERE ROWNUM <= 3")
                            sample_rows = cursor.fetchall()
                            print("   Muestra de datos:")
                            for i, row in enumerate(sample_rows, 1):
                                print(f"     Fila {i}: {row}")
                                
                    except Exception as e:
                        print(f"     Error al obtener datos: {str(e)}")
                else:
                    print("   No se encontraron columnas")
        
        # Buscar tablas que podrían contener datos de pacientes
        print(f"\n🎯 BUSCANDO TABLAS RELACIONADAS CON PACIENTES:")
        print("-" * 50)
        
        search_terms = ['PACIENTE', 'PATIENT', 'PERSONA', 'USUARIO', 'USER', 'DATOS', 'DATA']
        
        for term in search_terms:
            cursor.execute("""
                SELECT table_name 
                FROM user_tables 
                WHERE UPPER(table_name) LIKE :pattern
                ORDER BY table_name
            """, {"pattern": f"%{term}%"})
            
            matching_tables = cursor.fetchall()
            if matching_tables:
                print(f"   Tablas que contienen '{term}':")
                for table in matching_tables:
                    print(f"     • {table[0]}")
        
    except Exception as e:
        print(f"❌ Error durante la exploración: {str(e)}")
        
    finally:
        cursor.close()
        connection.close()

if __name__ == "__main__":
    print("🔍 EXPLORADOR DE BASE DE DATOS ORACLE")
    print("=====================================")
    explore_database()