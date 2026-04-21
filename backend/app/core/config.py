from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # OpenAI
    openai_api_key: str

    # Qdrant (local Docker)
    qdrant_url: str = "http://localhost:6333"
    qdrant_collection: str = "it_tickets"

    # SQLite
    database_url: str = "sqlite:///./database.db"

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}


settings = Settings()
