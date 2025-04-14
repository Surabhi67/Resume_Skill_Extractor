import os
import psycopg2
from dotenv import load_dotenv

load_dotenv()

db_host = "database"
db_port = 5432
db_name = os.getenv("POSTGRES_DB")
db_user = os.getenv("POSTGRES_USER")
db_password = os.getenv("POSTGRES_PASSWORD")

# Initialize connection and cursor as None
conn = None
cur = None

# Connect to PostgreSQL database
try:
    conn = psycopg2.connect(
        host=db_host,
        port=db_port,
        dbname=db_name,
        user=db_user,
        password=db_password
    )
    # Create a cursor to interact with the database
    cur = conn.cursor()
    
    # SQL query to create a table
    create_table_query = '''
    CREATE TABLE IF NOT EXISTS resume (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100),
        email VARCHAR(100) UNIQUE,
        phone VARCHAR(15),
        skills JSON,
        work_experience JSON,
        projects JSON
    );
    '''

    # Execute the SQL query to create the table
    cur.execute(create_table_query)

    # Commit the transaction
    conn.commit()
    print("Connected successfully and table created")

except Exception as e:
    print("Database connection failed")
    print(e)
    if conn:
        conn.close()
    raise e

print("Table created successfully.")
