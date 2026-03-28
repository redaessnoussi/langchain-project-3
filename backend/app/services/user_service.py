from sqlmodel import Session, select
from app.db.models import User
from app.schemas.user_schema import UserUpdate

def get_all_users(session: Session):
    return session.exec(select(User)).all()

def get_user_by_id(session: Session, user_id: int):
    return session.get(User, user_id)

def update_user(session: Session, user_id: int, data: UserUpdate):
    user = session.get(User, user_id)
    if not user:
        return None
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(user, key, value)
    session.add(user)
    session.commit()
    session.refresh(user)
    return user

def delete_user(session: Session, user_id: int):
    user = session.get(User, user_id)
    if not user:
        return None
    session.delete(user)
    session.commit()
    return user