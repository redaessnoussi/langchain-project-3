from fastapi import APIRouter, HTTPException, Depends
from sqlmodel import Session
from app.db.database import engine
from app.db.models import User
from app.schemas.user_schema import UserUpdate, UserCreate
from app.services.user_service import get_all_users, get_user_by_id, create_user, update_user, delete_user

router = APIRouter(prefix="/users", tags=["Users"])

def get_session():
    with Session(engine) as session:
        yield session

@router.get("/", response_model=list[User])
def list_users(session: Session = Depends(get_session)):
    return get_all_users(session)

@router.post("/", response_model=User, status_code=201)
def create_user_route(data: UserCreate, session: Session = Depends(get_session)):
    return create_user(session, data.model_dump())

@router.get("/{user_id}", response_model=User)
def get_user(user_id: int, session: Session = Depends(get_session)):
    user = get_user_by_id(session, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.put("/{user_id}", response_model=User)
def update_user_route(user_id: int, data: UserUpdate, session: Session = Depends(get_session)):
    user = update_user(session, user_id, data)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.delete("/{user_id}", response_model=User)
def delete_user_route(user_id: int, session: Session = Depends(get_session)):
    user = delete_user(session, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user