from sqlmodel import SQLModel, create_engine

# SQLite database file
DATABASE_URL = "sqlite:///./database.db"

# Create engine
engine = create_engine(
    DATABASE_URL,
    echo=True  # logs SQL queries
)

# Create tables function
def create_db_and_tables():
    SQLModel.metadata.create_all(engine)