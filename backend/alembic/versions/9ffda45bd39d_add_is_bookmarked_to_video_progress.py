"""Add is_bookmarked to video_progress

Revision ID: 9ffda45bd39d
Revises: 6b8e3ff87403
Create Date: 2025-03-26 16:03:26.339472

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '9ffda45bd39d'
down_revision = '6b8e3ff87403'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('video_progress', sa.Column('is_bookmarked', sa.Boolean(), nullable=True))
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_column('video_progress', 'is_bookmarked')
    # ### end Alembic commands ###
