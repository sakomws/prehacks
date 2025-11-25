"""add payment fields

Revision ID: 002
Revises: 001
Create Date: 2024-01-15

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '002'
down_revision = '001'
branch_labels = None
depends_on = None


def upgrade():
    # Add payment fields to sessions table
    op.add_column('sessions', sa.Column('payment_status', sa.String(), nullable=True))
    op.add_column('sessions', sa.Column('stripe_payment_id', sa.String(), nullable=True))
    
    # Set default value for existing records
    op.execute("UPDATE sessions SET payment_status = 'pending' WHERE payment_status IS NULL")


def downgrade():
    op.drop_column('sessions', 'stripe_payment_id')
    op.drop_column('sessions', 'payment_status')
