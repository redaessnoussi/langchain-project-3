import threading

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session
from app.data.dataset import preload
from app.db.database import create_db_and_tables, engine
from app.db.models import User
from app.api.routes_users import router as users_router
from app.api.routes_chat import router as chat_router
from app.api.routes_documents import router as documents_router
from app.api.routes_tickets import router as tickets_router

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(users_router)
app.include_router(chat_router)
app.include_router(documents_router)
app.include_router(tickets_router)

@app.on_event("startup")
def on_startup():
    create_db_and_tables()
    threading.Thread(target=preload, daemon=True).start()

@app.get("/")
def root():
    return {"message": "API is running 🚀"}

@app.get("/create-test-user")
def create_test_user():
    with Session(engine) as session:
        user = User(name="Reda", email="reda@test.com", phone="0600000000", address="Tangier")
        session.add(user)
        session.commit()
        session.refresh(user)
        return user