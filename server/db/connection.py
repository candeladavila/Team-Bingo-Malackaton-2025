import oracledb
import os
from dotenv import load_dotenv

dotenv_path = os.path.join(os.path.dirname(__file__), '..', '.env')
load_dotenv()

wallet_path = os.getenv("WALLET_PATH")
wallet_password = os.getenv("WALLET_PASSWORD")
user = os.getenv("DB_USER")
user_password = os.getenv("DB_PASSWORD")
dsn = os.getenv("DB_TNS_ALIAS")

connection = oracledb.connect(
    user=user,
    password=user_password,
    dsn=dsn,
    config_dir=wallet_path,
    wallet_location=wallet_path,
    wallet_password=wallet_password
)
