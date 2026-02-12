"""Add value column to gift_sessions table

Revision ID: 004_add_gift_value
Revises: 003_add_chat_tables
Create Date: 2024-12-22 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '004_add_gift_value'
down_revision = '003_add_chat_tables'
branch_labels = None
depends_on = None

def upgrade():
    # Add value column to gift_sessions table
    op.add_column('gift_sessions', sa.Column('value', sa.Float(), nullable=False, server_default='0.0'))

def downgrade():
    op.drop_column('gift_sessions', 'value')