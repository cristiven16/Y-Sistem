"""Nuevos cambios

Revision ID: 458ce605a4d9
Revises: 7852e9dc1bee
Create Date: 2025-03-02 09:42:59.520138

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "458ce605a4d9"
down_revision: Union[str, None] = "7852e9dc1bee"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_constraint(
        "centros_costos_codigo_key", "centros_costos", type_="unique"
    )
    op.create_unique_constraint(
        "uq_cc_org_codigo", "centros_costos", ["organizacion_id", "codigo"]
    )
    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_constraint("uq_cc_org_codigo", "centros_costos", type_="unique")
    op.create_unique_constraint(
        "centros_costos_codigo_key", "centros_costos", ["codigo"]
    )
    # ### end Alembic commands ###
