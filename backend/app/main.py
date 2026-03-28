from fastapi import FastAPI
from sqlmodel import Session
from app.db.database import create_db_and_tables, engine
from app.db.models import User
from app.api.routes_users import router as users_router

app = FastAPI()

app.include_router(users_router)

@app.on_event("startup")
def on_startup():
    create_db_and_tables()

@app.get("/")
def root():
    return {"message": "API is running 🚀"}

@app.get("/create-test-user")
def create_test_user():
    with Session(engine) as session:
        user = User(
            name="Reda",
            email="reda@test.com",
            phone="0600000000",
            address="Tangier"
        )
        session.add(user)
        session.commit()
        session.refresh(user)
        return user