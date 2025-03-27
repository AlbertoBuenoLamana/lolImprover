"""add_goals_table

Revision ID: a03b57e91c23
Revises: 199819f50419
Create Date: 2023-03-27 08:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'a03b57e91c23'
down_revision = '199819f50419'
branch_labels = None
depends_on = None


def upgrade():
    # Create the goals table
    op.create_table(
        'goals',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('title', sa.String(), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('status', sa.String(), server_default='active', nullable=False),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.text('now()'), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_goals_id'), 'goals', ['id'], unique=False)
    op.create_index(op.f('ix_goals_title'), 'goals', ['title'], unique=False)
    
    # Update the GameSession model to include goal_progress
    op.execute('ALTER TABLE game_sessions ADD COLUMN IF NOT EXISTS goal_progress JSONB')


def downgrade():
    # Remove the goal_progress column from game_sessions
    op.execute('ALTER TABLE game_sessions DROP COLUMN IF EXISTS goal_progress')
    
    # Drop the goals table
    op.drop_index(op.f('ix_goals_title'), table_name='goals')
    op.drop_index(op.f('ix_goals_id'), table_name='goals')
    op.drop_table('goals') 