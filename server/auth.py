from fastapi_users import FastAPIUsers
from fastapi_users.authentication import AuthenticationBackend, BearerTransport, JWTStrategy
from sqlalchemy.orm import Session
from fastapi import Depends
import os
from dotenv import load_dotenv
from models import User  # Your custom user model

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY")

# Dependency to get DB session
def get_user_db(db: Session = Depends(get_db)):
    return SQLAlchemyUserDatabase(User, db)

# JWT Authentication Setup
bearer_transport = BearerTransport(tokenUrl="auth/jwt/login")

def get_jwt_strategy() -> JWTStrategy:
    return JWTStrategy(secret=SECRET_KEY, lifetime_seconds=3600)

auth_backend = AuthenticationBackend(
    name="jwt",
    transport=bearer_transport,
    get_strategy=get_jwt_strategy,
)

# FastAPI Users Setup
fastapi_users = FastAPIUsers[User, int](
    get_user_db,
    [auth_backend],
)

# Define Pydantic models for User Create/Update/Read
class UserCreate:
    username: str
    email: str
    password: str

class UserUpdate(UserCreate):
    pass

class UserRead(UserCreate):
    id: int
    is_active: bool
    is_superuser: bool
