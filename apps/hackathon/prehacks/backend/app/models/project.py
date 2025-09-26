from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, ForeignKey, JSON, Enum
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from enum import Enum as PyEnum
from datetime import datetime
from typing import Optional, List

Base = declarative_base()

class ProjectStatus(PyEnum):
    DRAFT = "draft"
    ACTIVE = "active"
    COMPLETED = "completed"
    ARCHIVED = "archived"

class ProjectVisibility(PyEnum):
    PUBLIC = "public"
    PRIVATE = "private"
    UNLISTED = "unlisted"

class ProjectCategory(PyEnum):
    WEB_APP = "web_app"
    MOBILE_APP = "mobile_app"
    DESKTOP_APP = "desktop_app"
    API = "api"
    LIBRARY = "library"
    GAME = "game"
    AI_ML = "ai_ml"
    BLOCKCHAIN = "blockchain"
    IOT = "iot"
    OTHER = "other"

class Project(Base):
    __tablename__ = "projects"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False, index=True)
    description = Column(Text, nullable=True)
    short_description = Column(String(500), nullable=True)
    
    # Project metadata
    status = Column(Enum(ProjectStatus), default=ProjectStatus.DRAFT, nullable=False)
    visibility = Column(Enum(ProjectVisibility), default=ProjectVisibility.PUBLIC, nullable=False)
    category = Column(Enum(ProjectCategory), nullable=False)
    
    # Technical details
    tech_stack = Column(JSON, nullable=True)  # List of technologies
    programming_languages = Column(JSON, nullable=True)  # List of languages
    frameworks = Column(JSON, nullable=True)  # List of frameworks
    databases = Column(JSON, nullable=True)  # List of databases
    
    # Project URLs
    repository_url = Column(String(500), nullable=True)
    live_url = Column(String(500), nullable=True)
    demo_url = Column(String(500), nullable=True)
    documentation_url = Column(String(500), nullable=True)
    
    # Media
    thumbnail_url = Column(String(500), nullable=True)
    images = Column(JSON, nullable=True)  # List of image URLs
    
    # Statistics
    views_count = Column(Integer, default=0, nullable=False)
    likes_count = Column(Integer, default=0, nullable=False)
    forks_count = Column(Integer, default=0, nullable=False)
    stars_count = Column(Integer, default=0, nullable=False)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    published_at = Column(DateTime(timezone=True), nullable=True)
    
    # Relationships
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    owner = relationship("User", back_populates="owned_projects")
    
    collaborators = relationship("ProjectCollaborator", back_populates="project")
    tags = relationship("ProjectTag", back_populates="project")
    comments = relationship("ProjectComment", back_populates="project")
    
    # Hackathon specific
    hackathon_name = Column(String(255), nullable=True)
    hackathon_url = Column(String(500), nullable=True)
    hackathon_date = Column(DateTime(timezone=True), nullable=True)
    awards = Column(JSON, nullable=True)  # List of awards won
    
    # Project settings
    allow_forking = Column(Boolean, default=True, nullable=False)
    allow_issues = Column(Boolean, default=True, nullable=False)
    allow_discussions = Column(Boolean, default=True, nullable=False)
    
    # Git integration
    git_repo_path = Column(String(500), nullable=True)
    default_branch = Column(String(100), default="main", nullable=False)
    last_commit_hash = Column(String(40), nullable=True)
    last_commit_date = Column(DateTime(timezone=True), nullable=True)

class ProjectCollaborator(Base):
    __tablename__ = "project_collaborators"
    
    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    role = Column(String(50), default="contributor", nullable=False)  # owner, maintainer, contributor
    permissions = Column(JSON, nullable=True)  # Specific permissions
    added_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    
    project = relationship("Project", back_populates="collaborators")
    user = relationship("User")

class ProjectTag(Base):
    __tablename__ = "project_tags"
    
    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    tag_name = Column(String(100), nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    
    project = relationship("Project", back_populates="tags")

class ProjectComment(Base):
    __tablename__ = "project_comments"
    
    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    content = Column(Text, nullable=False)
    parent_id = Column(Integer, ForeignKey("project_comments.id"), nullable=True)  # For replies
    is_deleted = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    
    project = relationship("Project", back_populates="comments")
    user = relationship("User")
    parent = relationship("ProjectComment", remote_side=[id])
    replies = relationship("ProjectComment", back_populates="parent")
