import oracledb
import os
from dotenv import load_dotenv

load_dotenv()

wallet_path = os.getenv("WALLET_PATH")
wallet_password = os.getenv("WALLET_PASSWORD")
user = os.getenv("DB_USER")
user_password = os.getenv("DB_PASSWORD")
dsn = os.getenv("DB_TNS_ALIAS")  

connection = oracledb.connect(
    user=user,                              # database user 
    password=user_password,                 # database password 
    dsn=dsn,                                # TNS Alias from tnsnames.ora
    config_dir=wallet_path,                 # directory with tnsnames.ora
    wallet_location=wallet_path,            # directory with ewallet.pem
    wallet_password=wallet_password         # wallet password
)


with connection.cursor() as cursor:
    cursor.execute("""
    CREATE OR REPLACE VIEW VISTA_MUY_INTERESANTE AS
    SELECT "Comunidad Autónoma" AS region,
            "Diagnóstico Principal" AS enfermedad,
            COUNT("Número de registro anual") AS num_casos
    FROM ENFERMEDADESMENTALESDIAGNOSTICO
    GROUP BY "Comunidad Autónoma", "Diagnóstico Principal"
    ORDER BY "Comunidad Autónoma", num_casos DESC
    """)

    cursor.execute("SELECT * FROM VISTA_MUY_INTERESANTE")
    for row in cursor:
        print(row)