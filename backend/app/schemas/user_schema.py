from sqlmodel import SQLModel
from typing import Optional

class UserUpdate(SQLModel):
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None