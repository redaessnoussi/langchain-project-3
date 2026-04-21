from sqlmodel import SQLModel, create_engine
from app.core.config import settings

engine = create_engine(settings.database_url, echo=True)

def create_db_and_tables():
    SQLModel.metadata.create_all(engine)