"""
Edge-case tests for SQLAlchemy models.

Covers: model creation, enum values, relationships, default values,
and boundary conditions.
"""

import pytest

from app.models.user import User, UserRole, UserSession, UserProgress
from app.models.community import Discussion, Comment


# ---------------------------------------------------------------------------
# User model
# ---------------------------------------------------------------------------

class TestUserModel:

    def test_create_user(self, db_session):
        user = User(
            email="model@test.com",
            username="modeluser",
            hashed_password="hash123",
            display_name="Model User",
        )
        db_session.add(user)
        db_session.commit()
        db_session.refresh(user)

        assert user.id is not None
        assert user.is_active is True
        assert user.is_superuser is False

    def test_user_role_enum(self):
        assert UserRole.LEARNER == "learner"
        assert UserRole.EDUCATOR == "educator"
        assert UserRole.EXPERT == "expert"
        assert UserRole.ADMIN == "admin"

    def test_unique_email_constraint(self, db_session):
        u1 = User(email="dup@test.com", username="user1", hashed_password="h")
        u2 = User(email="dup@test.com", username="user2", hashed_password="h")
        db_session.add(u1)
        db_session.commit()
        db_session.add(u2)
        with pytest.raises(Exception):  # IntegrityError
            db_session.commit()
        db_session.rollback()

    def test_unique_username_constraint(self, db_session):
        u1 = User(email="a@test.com", username="same", hashed_password="h")
        u2 = User(email="b@test.com", username="same", hashed_password="h")
        db_session.add(u1)
        db_session.commit()
        db_session.add(u2)
        with pytest.raises(Exception):
            db_session.commit()
        db_session.rollback()

    def test_nullable_fields(self, db_session):
        user = User(
            email="min@test.com",
            username="minuser",
            hashed_password="h",
        )
        db_session.add(user)
        db_session.commit()
        assert user.display_name is None
        assert user.avatar_url is None
        assert user.bio is None

    def test_default_community_role(self, db_session):
        user = User(
            email="role@test.com",
            username="roleuser",
            hashed_password="h",
        )
        db_session.add(user)
        db_session.commit()
        # community_role is stored as a String column with default UserRole.LEARNER
        assert user.community_role in (UserRole.LEARNER, "learner")


# ---------------------------------------------------------------------------
# UserProgress model
# ---------------------------------------------------------------------------

class TestUserProgressModel:

    def test_create_progress(self, db_session):
        user = User(email="prog@test.com", username="proguser", hashed_password="h")
        db_session.add(user)
        db_session.commit()

        progress = UserProgress(
            user_id=user.id,
            module_slug="ai-ethics-basics",
            lesson_id="lesson-1",
            status="started",
            score=0,
        )
        db_session.add(progress)
        db_session.commit()

        assert progress.id is not None
        assert progress.status == "started"

    def test_progress_default_score(self, db_session):
        user = User(email="dscore@test.com", username="dscoreuser", hashed_password="h")
        db_session.add(user)
        db_session.commit()

        progress = UserProgress(user_id=user.id, module_slug="test")
        db_session.add(progress)
        db_session.commit()
        assert progress.score == 0

    def test_progress_boundary_score(self, db_session):
        user = User(email="bscore@test.com", username="bscoreuser", hashed_password="h")
        db_session.add(user)
        db_session.commit()

        progress = UserProgress(user_id=user.id, module_slug="test", score=100)
        db_session.add(progress)
        db_session.commit()
        assert progress.score == 100


# ---------------------------------------------------------------------------
# Discussion & Comment models
# ---------------------------------------------------------------------------

class TestCommunityModels:

    def test_create_discussion(self, db_session):
        user = User(email="disc@test.com", username="discuser", hashed_password="h")
        db_session.add(user)
        db_session.commit()

        disc = Discussion(
            title="Test Discussion",
            content="This is a test",
            author_id=user.id,
            category="AI Ethics",
        )
        db_session.add(disc)
        db_session.commit()

        assert disc.id is not None
        assert disc.author_id == user.id

    def test_create_comment(self, db_session):
        user = User(email="comm@test.com", username="commuser", hashed_password="h")
        db_session.add(user)
        db_session.commit()

        disc = Discussion(
            title="Discussion for Comment",
            content="Body",
            author_id=user.id,
        )
        db_session.add(disc)
        db_session.commit()

        comment = Comment(
            content="Great post!",
            author_id=user.id,
            discussion_id=disc.id,
        )
        db_session.add(comment)
        db_session.commit()

        assert comment.id is not None
        assert comment.discussion_id == disc.id

    def test_discussion_comment_relationship(self, db_session):
        user = User(email="rel@test.com", username="reluser", hashed_password="h")
        db_session.add(user)
        db_session.commit()

        disc = Discussion(title="Rel Test", content="Body", author_id=user.id)
        db_session.add(disc)
        db_session.commit()

        c1 = Comment(content="Comment 1", author_id=user.id, discussion_id=disc.id)
        c2 = Comment(content="Comment 2", author_id=user.id, discussion_id=disc.id)
        db_session.add_all([c1, c2])
        db_session.commit()

        # Refresh and check relationship
        db_session.refresh(disc)
        assert len(disc.comments) == 2

    def test_cascade_delete_comments(self, db_session):
        user = User(email="cas@test.com", username="casuser", hashed_password="h")
        db_session.add(user)
        db_session.commit()

        disc = Discussion(title="Cascade", content="Body", author_id=user.id)
        db_session.add(disc)
        db_session.commit()

        comment = Comment(content="Will be deleted", author_id=user.id, discussion_id=disc.id)
        db_session.add(comment)
        db_session.commit()

        disc_id = disc.id
        db_session.delete(disc)
        db_session.commit()

        # Comment should be cascade-deleted
        remaining = db_session.query(Comment).filter(Comment.discussion_id == disc_id).all()
        assert len(remaining) == 0

    def test_empty_title_discussion(self, db_session):
        """Discussion with empty title — DB allows it (no min_length constraint)."""
        user = User(email="etitle@test.com", username="etitleuser", hashed_password="h")
        db_session.add(user)
        db_session.commit()

        disc = Discussion(title="", content="content", author_id=user.id)
        db_session.add(disc)
        db_session.commit()
        assert disc.title == ""

    def test_very_long_content(self, db_session):
        user = User(email="long@test.com", username="longuser", hashed_password="h")
        db_session.add(user)
        db_session.commit()

        long_content = "x" * 10000
        disc = Discussion(title="Long", content=long_content, author_id=user.id)
        db_session.add(disc)
        db_session.commit()
        assert len(disc.content) == 10000
