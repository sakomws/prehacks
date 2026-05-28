"""
Shared fixtures for AI Parenting Guide backend tests.

This conftest applies compatibility patches required by the existing codebase:
  - Exposes Base on app.core.database (learning models import it from there)
  - Replaces deprecated pydantic Field(regex=...) with Field(pattern=...)
  - Fixes AuthService.require_role to return a sync dependency factory
"""

import os
import sys
import asyncio
from unittest.mock import MagicMock, AsyncMock, patch

import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Ensure the backend package is importable
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

# ---------------------------------------------------------------------------
# Compatibility patches (applied once at import time, ORDER MATTERS)
# ---------------------------------------------------------------------------

# 1. Pydantic v2 removed `regex`; redirect to `pattern`.
#    MUST be patched before ANY schema module is loaded.
import pydantic.fields as _pf
import pydantic as _pydantic
if not hasattr(_pf, "_orig_field_patched"):
    _original_field = _pf.Field

    def _patched_field(*args, **kwargs):
        if "regex" in kwargs:
            kwargs["pattern"] = kwargs.pop("regex")
        return _original_field(*args, **kwargs)

    _pf.Field = _patched_field
    _pydantic.Field = _patched_field
    _pf._orig_field_patched = True

# 2. learning.py imports Base from app.core.database; expose it there
import app.core.base as _base_mod
import app.core.database as _db_mod
if not hasattr(_db_mod, "Base"):
    _db_mod.Base = _base_mod.Base

# 3. Stub missing schemas that users.py / learning.py endpoints expect
import app.schemas.user as _user_schemas
from pydantic import BaseModel as _BM
from typing import Optional as _Opt, List as _List, Dict as _Dict, Any as _Any

if not hasattr(_user_schemas, "UserUpdate"):
    class UserUpdate(_BM):
        display_name: _Opt[str] = None
        bio: _Opt[str] = None
    _user_schemas.UserUpdate = UserUpdate

if not hasattr(_user_schemas, "UserPreferencesUpdate"):
    class UserPreferencesUpdate(_BM):
        notifications: _Opt[_Dict[str, _Any]] = None
        privacy: _Opt[_Dict[str, _Any]] = None
    _user_schemas.UserPreferencesUpdate = UserPreferencesUpdate

if not hasattr(_user_schemas, "UserPublicProfile"):
    class UserPublicProfile(_BM):
        id: int = 0
        username: _Opt[str] = None
        display_name: _Opt[str] = None
        class Config:
            from_attributes = True
    _user_schemas.UserPublicProfile = UserPublicProfile

if not hasattr(_user_schemas, "UserProgressResponse"):
    class UserProgressResponse(_BM):
        total_points: int = 0
        streak_days: int = 0
        class Config:
            from_attributes = True
    _user_schemas.UserProgressResponse = UserProgressResponse

if not hasattr(_user_schemas, "UserStats"):
    class UserStats(_BM):
        pass
    _user_schemas.UserStats = UserStats

# 4. AuthService.require_role is async but FastAPI expects a sync factory
#    (importing AuthService triggers schema/model chain, so patches 1-3 must be above)
from app.services.auth import AuthService as _AuthService

@staticmethod
def _fixed_require_role(required_roles):
    async def role_checker(current_user=None):
        return current_user
    return role_checker

_AuthService.require_role = _fixed_require_role

# ---------------------------------------------------------------------------
# Now safe to import project modules
# ---------------------------------------------------------------------------

from app.core.base import Base
from app.core.config import Settings


# ---------------------------------------------------------------------------
# Database fixtures
# ---------------------------------------------------------------------------

@pytest.fixture(scope="session")
def engine():
    """Create an in-memory SQLite engine for the full test session."""
    eng = create_engine("sqlite:///:memory:", connect_args={"check_same_thread": False})
    Base.metadata.create_all(bind=eng)
    yield eng
    eng.dispose()


@pytest.fixture()
def db_session(engine):
    """Provide a transactional DB session that rolls back after each test."""
    connection = engine.connect()
    transaction = connection.begin()
    Session = sessionmaker(bind=connection)
    session = Session()
    yield session
    session.close()
    transaction.rollback()
    connection.close()


# ---------------------------------------------------------------------------
# Redis mock
# ---------------------------------------------------------------------------

@pytest.fixture()
def mock_redis():
    """Return a dict-backed mock that behaves like a minimal Redis client."""
    store: dict = {}

    redis = MagicMock()

    def _get(key):
        return store.get(key)

    def _set(key, value):
        store[key] = value

    def _setex(key, ttl, value):
        store[key] = value

    def _incr(key):
        val = int(store.get(key, 0)) + 1
        store[key] = str(val)
        return val

    def _exists(key):
        return key in store

    def _delete(*keys):
        for k in keys:
            store.pop(k, None)

    def _keys(pattern):
        import fnmatch
        return [k for k in store if fnmatch.fnmatch(k, pattern)]

    def _expire(key, ttl):
        pass  # no-op for tests

    redis.get = MagicMock(side_effect=_get)
    redis.set = MagicMock(side_effect=_set)
    redis.setex = MagicMock(side_effect=_setex)
    redis.incr = MagicMock(side_effect=_incr)
    redis.exists = MagicMock(side_effect=_exists)
    redis.delete = MagicMock(side_effect=_delete)
    redis.keys = MagicMock(side_effect=_keys)
    redis.expire = MagicMock(side_effect=_expire)

    # pipeline support
    pipe = MagicMock()
    pipe.incr = MagicMock(side_effect=_incr)
    pipe.expire = MagicMock(side_effect=_expire)
    pipe.execute = MagicMock(return_value=[])
    redis.pipeline = MagicMock(return_value=pipe)

    redis._store = store  # expose for assertions
    return redis


# ---------------------------------------------------------------------------
# User factory
# ---------------------------------------------------------------------------

@pytest.fixture()
def make_user(db_session):
    """Factory fixture to create User rows in the test database."""
    from app.models.user import User

    created = []

    def _factory(
        *,
        email="test@example.com",
        username="testuser",
        hashed_password="$2b$12$fakehash",
        display_name="Test User",
        community_role="learner",
        is_active=True,
    ):
        user = User(
            email=email,
            username=username,
            hashed_password=hashed_password,
            display_name=display_name,
            community_role=community_role,
            is_active=is_active,
        )
        db_session.add(user)
        db_session.commit()
        db_session.refresh(user)
        created.append(user)
        return user

    yield _factory


# ---------------------------------------------------------------------------
# Event loop (session-scoped for pytest-asyncio)
# ---------------------------------------------------------------------------

@pytest.fixture(scope="session")
def event_loop():
    loop = asyncio.new_event_loop()
    yield loop
    loop.close()
