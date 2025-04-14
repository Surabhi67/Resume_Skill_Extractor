from fastapi import FastAPI, Depends, UploadFile, File, HTTPException
from fastapi_users import FastAPIUsers
from fastapi_users.authentication import AuthenticationBackend, BearerTransport, JWTStrategy
from fastapi_users.manager import BaseUserManager
from fastapi_users_db_sqlalchemy import SQLAlchemyUserDatabase
from sqlalchemy.ext.asyncio import AsyncSession
from models import Resume, User, Base
from sqlalchemy import select
from database import async_engine, get_async_session
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.dialects.postgresql import JSONB  # Ensure you import JSONB
from contextlib import asynccontextmanager
from typing import Optional, AsyncGenerator
from llm import askllm
import os
import time
import pymupdf
from psycopg2.extras import Json
from fastapi_users_db_sqlalchemy import SQLAlchemyUserDatabase


load_dotenv()

# User Schemas
from fastapi_users import schemas

class UserRead(schemas.BaseUser[int]):
    full_name: Optional[str] = None

class UserCreate(schemas.BaseUserCreate):
    full_name: Optional[str] = None

class UserUpdate(schemas.BaseUserUpdate):
    full_name: Optional[str] = None

SECRET = os.getenv("SECRET_KEY")

# Auth setup
bearer_transport = BearerTransport(tokenUrl="auth/jwt/login")

def get_jwt_strategy() -> JWTStrategy:
    return JWTStrategy(secret=SECRET, lifetime_seconds=int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES")) * 60)

auth_backend = AuthenticationBackend(
    name="jwt",
    transport=bearer_transport,
    get_strategy=get_jwt_strategy,
)

# User Manager
class UserManager(BaseUserManager[User, int]):
    user_db_model = User
    reset_password_token_secret = SECRET
    verification_token_secret = SECRET

    def __init__(self, user_db: SQLAlchemyUserDatabase):
        super().__init__(user_db)

    def parse_id(self, id: str) -> int:
        return int(id)  # Assuming your user ID is an integer



async def get_user_db(session: AsyncSession = Depends(get_async_session)) -> AsyncGenerator[SQLAlchemyUserDatabase, None]:
    yield SQLAlchemyUserDatabase(session, User)


async def get_user_manager(user_db=Depends(get_user_db)) -> AsyncGenerator[UserManager, None]:
    yield UserManager(user_db)

fastapi_users = FastAPIUsers[User, int](
    get_user_manager,
    [auth_backend],
)


# Create tables
async def init_models():
    async with async_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_models()
    yield

app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Auth routes
app.include_router(
    fastapi_users.get_auth_router(auth_backend),
    prefix="/auth/jwt",
    tags=["auth"],
)
app.include_router(
    fastapi_users.get_register_router(UserRead, UserCreate),
    prefix="/auth",
    tags=["auth"],
)
app.include_router(
    fastapi_users.get_users_router(UserRead, UserUpdate),
    prefix="/users",
    tags=["users"],
)

# Resume endpoints
@app.post("/upload-resume/")
async def upload_resume(file: UploadFile = File(...), session: AsyncSession = Depends(get_async_session), user: User = Depends(fastapi_users.current_user())):
    content = await file.read()
    with open("temp.pdf", "wb") as f:
        f.write(content)

    text = ""
    doc = pymupdf.open("temp.pdf")
    for page in doc:
        text += page.get_text()
    doc.close()

    resume_data = askllm(text)
    new_resume = Resume(name=resume_data.get('name', 'Unknown'), data=resume_data, user_id=user.id)
    session.add(new_resume)
    await session.commit()
    await session.refresh(new_resume)

    return {"id": new_resume.id, "name": new_resume.name}

@app.get("/resumes/")
async def get_resumes(
    session: AsyncSession = Depends(get_async_session),
    user: User = Depends(fastapi_users.current_user(active=True))
    ):
    result = await session.execute(
        select(Resume).where(Resume.user_id == user.id)
    )
    resumes = result.scalars().all()
    return resumes

@app.post("/pdf_to_text")
async def extract_text(file: UploadFile = File(...)):
    content = await file.read()
    with open("temp.pdf", "wb") as f:
        f.write(content)
    text = ""
    doc = pymupdf.open("temp.pdf")
    for page in doc:
        text += page.get_text()
    doc.close()

    return askllm(text)


@app.post("/save_resume")
async def save_resume(
    resume_data: dict,
    session: AsyncSession = Depends(get_async_session),
    user: User = Depends(fastapi_users.current_user())
):
    try:
        new_resume = Resume(
            name=resume_data.get('name', ''),
            email=resume_data.get('email', ''),
            phone=resume_data.get('phone', ''),
            # Using JSONB type to store complex data in the database
            skills=resume_data.get('skills', []),  # No need for Json() wrapper, direct list
            work_experience=resume_data.get('work_experience', []),  # No need for Json() wrapper
            projects=resume_data.get('projects', []),  # No need for Json() wrapper
            user_id=user.id
        )

        session.add(new_resume)
        await session.commit()
        await session.refresh(new_resume)

        return {"success": True, "id": new_resume.id}

    except Exception as e:
        await session.rollback()
        raise HTTPException(status_code=500, detail=str(e))


from fastapi import status
from pydantic import BaseModel

# Pydantic model for batch delete
class ResumeDeleteRequest(BaseModel):
    ids: list[int]

# Single resume delete
@app.delete("/resumes/{resume_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_resume(
    resume_id: int,
    session: AsyncSession = Depends(get_async_session),
    user: User = Depends(fastapi_users.current_user(active=True))
):
    result = await session.execute(
        select(Resume).where(Resume.id == resume_id, Resume.user_id == user.id)
    )
    resume = result.scalar_one_or_none()
    if resume is None:
        raise HTTPException(status_code=404, detail="Resume not found")

    await session.delete(resume)
    await session.commit()
    return

# Batch delete
@app.post("/resumes/delete-many", status_code=status.HTTP_204_NO_CONTENT)
async def delete_many_resumes(
    request: ResumeDeleteRequest,
    session: AsyncSession = Depends(get_async_session),
    user: User = Depends(fastapi_users.current_user(active=True))
):
    result = await session.execute(
        select(Resume).where(Resume.id.in_(request.ids), Resume.user_id == user.id)
    )
    resumes = result.scalars().all()

    if not resumes:
        raise HTTPException(status_code=404, detail="No resumes found to delete")

    for resume in resumes:
        await session.delete(resume)

    await session.commit()
    return

