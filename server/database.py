from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from dotenv import load_dotenv
import os

load_dotenv()

# Async-compatible DATABASE_URL format
DATABASE_URL = os.getenv("DATABASE_URL")

print(DATABASE_URL)

# Create async engine
async_engine = create_async_engine(DATABASE_URL, echo=True)

# Create async session
async_session_maker = sessionmaker(
    bind=async_engine,
    class_=AsyncSession,
    expire_on_commit=False
)

# Dependency for routes
async def get_async_session() -> AsyncSession:
    async with async_session_maker() as session:
        yield session

# Declarative base
Base = declarative_base()
