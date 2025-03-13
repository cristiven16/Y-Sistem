"""Nuevos cambios

Revision ID: 559a7c179205
Revises: 4437659aee7c
Create Date: 2025-03-10 17:33:10.357289

"""

from alembic import op
import sqlalchemy as sa
from typing import Sequence, Union

# revision identifiers, used by Alembic.
revision: str = "559a7c179205"
down_revision: Union[str, None] = "4437659aee7c"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1) Agregar la columna `nivel` con nullable=True (permite valores nulos).
    op.add_column(
        "roles",
        sa.Column("nivel", sa.Integer(), nullable=True)
    )

    # 2) Rellenar las filas existentes con un nivel por defecto,
    #    evitando que queden en NULL. Elige el valor que quieras (aquí 999).
    op.execute("UPDATE roles SET nivel = 999 WHERE nivel IS NULL")

    # 3) Alterar la columna para ponerla NOT NULL (ya no hay filas con NULL).
    op.alter_column(
        "roles",
        "nivel",
        existing_type=sa.Integer(),
        nullable=False
    )


def downgrade() -> None:
    # Volver atrás: simplemente quitamos la columna `nivel`.
    op.drop_column("roles", "nivel")
