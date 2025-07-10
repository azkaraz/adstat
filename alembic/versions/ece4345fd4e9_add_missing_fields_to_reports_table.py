"""add missing fields to reports table

Revision ID: ece4345fd4e9
Revises: 001_initial_schema
Create Date: 2025-07-11 00:03:01.556433

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'ece4345fd4e9'
down_revision = '001_initial_schema'
branch_labels = None
depends_on = None

def upgrade():
    op.add_column('reports', sa.Column('filename', sa.String(), nullable=False))
    op.add_column('reports', sa.Column('original_filename', sa.String(), nullable=False))
    op.add_column('reports', sa.Column('file_path', sa.String(), nullable=False))
    op.add_column('reports', sa.Column('file_size', sa.Integer(), nullable=False))
    op.add_column('reports', sa.Column('status', sa.String(), nullable=False, server_default='uploaded'))
    op.add_column('reports', sa.Column('error_message', sa.Text(), nullable=True))

def downgrade():
    op.drop_column('reports', 'error_message')
    op.drop_column('reports', 'status')
    op.drop_column('reports', 'file_size')
    op.drop_column('reports', 'file_path')
    op.drop_column('reports', 'original_filename')
    op.drop_column('reports', 'filename') 