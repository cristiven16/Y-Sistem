"""actualizacion de modelos

Revision ID: 8a54bb11af70
Revises: 35c7877fd200
Create Date: 2025-03-01 14:14:40.962535
"""

from typing import Sequence, Union
from alembic import op    # <--- IMPORTA 'op' AQUÍ
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = "8a54bb11af70"
down_revision: Union[str, None] = "35c7877fd200"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    # EJEMPLO:
    # 1) rename_table
    op.rename_table("sucursal", "sucursales")

    # 2) add_column con nullable=True
    op.add_column("sucursales", sa.Column("organizacion_id", sa.Integer(), nullable=True))
    # 3) asignar valor a las filas existentes
    op.execute("UPDATE sucursales SET organizacion_id = 1 WHERE organizacion_id IS NULL")
    # 4) cambiar a nullable=False
    op.alter_column("sucursales", "organizacion_id", existing_type=sa.Integer(), nullable=False)
    # 5) crear FK
    op.create_foreign_key(None, "sucursales", "organizaciones", ["organizacion_id"], ["id"])

    # ... etc. con el resto de instrucciónes (op.create_table, op.add_column, etc.)

def downgrade() -> None:
    # Revertir
    pass
