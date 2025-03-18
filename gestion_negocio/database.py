import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Load environment variables from .env file (only in local environment)
load_dotenv()

# Database credentials.  Use environment variables for security.
db_user = os.getenv("DB_USER", "postgres")  # Default to "postgres" for local development
db_password = os.getenv("DB_PASSWORD", "")  # Default to empty string for local dev (should use a password!)
db_name = os.getenv("DB_NAME", "mydb")      # Default database name

# Cloud SQL connection name (automatically set by Cloud Run when configured).
cloud_sql_connection_name = os.getenv("CLOUD_SQL_CONNECTION_NAME")

# Debug prints (keep these for now!)
print("DEBUG => DB_USER:", db_user)
print("DEBUG => DB_PASSWORD:", db_password)  # Don't print passwords in production!
print("DEBUG => DB_NAME:", db_name)
print("DEBUG => CLOUD_SQL_CONNECTION_NAME:", cloud_sql_connection_name)

# Construct the database URL based on the environment.
if cloud_sql_connection_name:
    # Running on Cloud Run with Cloud SQL connection
    db_host = f"/cloudsql/{cloud_sql_connection_name}"
    database_url = f"postgresql+psycopg2://{db_user}:{db_password}@{db_host}/{db_name}"
else:
    # Running locally (assumes Cloud SQL Auth Proxy is running on port 5432)
    db_host = os.getenv("DB_HOST", "localhost") # Default to localhost if DB_HOST not set.
    database_url = f"postgresql+psycopg2://{db_user}:{db_password}@{db_host}:5432/{db_name}"


print("DEBUG => final database_url:", database_url)

if not database_url:
    raise ValueError("Database URL could not be determined.")

# Create the SQLAlchemy engine
engine = create_engine(database_url)

# Create a session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Dependency to get a database session (for FastAPI)
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()