from sqlalchemy import Column, Integer, String, Boolean, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import JSONB  # For storing JSON data

# SQLAlchemy base class
Base = declarative_base()

# Define the User model for FastAPI Users
class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(100), unique=True, index=True)
    hashed_password = Column(String(200), nullable=False)
    full_name = Column(String(100), nullable=True)
    is_active = Column(Boolean(), default=True)
    is_superuser = Column(Boolean(), default=False)
    is_verified = Column(Boolean(), default=False)
    
    # Define relationship with Resume
    resumes = relationship("Resume", back_populates="user")

# Define the Resume model
class Resume(Base):
    __tablename__ = "resumes"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(100))
    phone = Column(String(15))
    
    # Use JSONB for storing complex data like skills, work_experience, and projects
    skills = Column(JSONB, nullable=True)
    work_experience = Column(JSONB, nullable=True)
    projects = Column(JSONB, nullable=True)
    
    # Foreign key relationship with User
    user_id = Column(Integer, ForeignKey("users.id"))
    
    # Define relationship with User (one-to-many)
    user = relationship("User", back_populates="resumes")

