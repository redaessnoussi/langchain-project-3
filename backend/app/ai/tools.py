from typing import Optional
from pydantic import BaseModel
from langchain_core.tools import tool
from sqlmodel import Session, select
from app.db.database import engine
from app.db.models import User


@tool
def get_all_users() -> str:
    """Get a list of all users in the database."""
    with Session(engine) as session:
        users = session.exec(select(User)).all()
        if not users:
            return "No users found in the database."
        return "\n".join(
            [f"ID: {u.id} | Name: {u.name} | Email: {u.email} | Phone: {u.phone} | Address: {u.address}"
             for u in users]
        )


@tool
def get_user_by_id(user_id: int) -> str:
    """Get a specific user's details by their numeric ID."""
    with Session(engine) as session:
        user = session.get(User, user_id)
        if not user:
            return f"No user found with ID {user_id}."
        return f"ID: {user.id} | Name: {user.name} | Email: {user.email} | Phone: {user.phone} | Address: {user.address}"


class UpdateUserInput(BaseModel):
    user_id: int
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None


@tool("update_user", args_schema=UpdateUserInput)
def update_user(user_id: int, name: Optional[str] = None, email: Optional[str] = None,
                phone: Optional[str] = None, address: Optional[str] = None) -> str:
    """Update one or more fields of a user by their ID. Only include fields you want to change."""
    with Session(engine) as session:
        user = session.get(User, user_id)
        if not user:
            return f"No user found with ID {user_id}."
        if name is not None:
            user.name = name
        if email is not None:
            user.email = email
        if phone is not None:
            user.phone = phone
        if address is not None:
            user.address = address
        session.add(user)
        session.commit()
        session.refresh(user)
        return f"User updated! ID: {user.id} | Name: {user.name} | Email: {user.email} | Phone: {user.phone} | Address: {user.address}"


@tool
def delete_user(user_id: int) -> str:
    """Permanently delete a user by their ID."""
    with Session(engine) as session:
        user = session.get(User, user_id)
        if not user:
            return f"No user found with ID {user_id}."
        name = user.name
        session.delete(user)
        session.commit()
        return f"User '{name}' (ID: {user_id}) has been deleted."