from sqlmodel import SQLModel
from typing import Optional

class UserCreate(SQLModel):
    name: str
    email: str
    phone: str
    address: str

class UserUpdate(SQLModel):
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None