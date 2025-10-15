import os
from dotenv import load_dotenv
import oracledb

load_dotenv()

user = os.getenv('DB_USER')
pw = os.getenv('DB_PASSWORD')
dsn = os.getenv('DB_TNS_ALIAS')
wallet_path = os.getenv('WALLET_PATH')

def main():
    try:
        conn = oracledb.connect(user=user, password=pw, dsn=dsn, config_dir=wallet_path, wallet_location=wallet_path, wallet_password=os.getenv('WALLET_PASSWORD'))
        print('Connected as', user)
        cur = conn.cursor()
        print('\nChecking for ENFERMEDADESMENTALESDIAGNOSTICO (exact match)...')
        cur.execute("SELECT owner, table_name FROM all_tables WHERE table_name = 'ENFERMEDADESMENTALESDIAGNOSTICO'")
        rows = cur.fetchall()
        if rows:
            for r in rows:
                print('FOUND:', r)
        else:
            print('Not found. Listing similar tables (LIKE %ENFERMEDAD%)')
            cur.execute("SELECT owner, table_name FROM all_tables WHERE table_name LIKE '%ENFERMEDAD%'")
            rows2 = cur.fetchall()
            if rows2:
                for r in rows2:
                    print('SIMILAR:', r)
            else:
                print('No similar tables found in ALL_TABLES')
        cur.close()
        conn.close()
    except Exception as e:
        print('Error connecting or querying:', e)

if __name__ == '__main__':
    main()
