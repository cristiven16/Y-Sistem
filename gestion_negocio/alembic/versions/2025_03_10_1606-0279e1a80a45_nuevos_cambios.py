"""Nuevos cambios

Revision ID: 0279e1a80a45
Revises: a4ca147d1200
Create Date: 2025-03-10 16:06:57.290834

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = "0279e1a80a45"
down_revision: Union[str, None] = "a4ca147d1200"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1) Crear el tipo enumerado 'tipousuario'
    tipousuario_enum = postgresql.ENUM('superadmin', 'admin', 'empleado',
                                       name='tipousuario')
    tipousuario_enum.create(op.get_bind(), checkfirst=True)

    # 2) Añadir la columna con server_default para filas existentes
    op.add_column(
        "usuarios",
        sa.Column(
            "tipo_usuario",
            sa.Enum('superadmin', 'admin', 'empleado', name="tipousuario"),
            server_default='empleado',   # <-- Valor por defecto para filas anteriores
            nullable=False,
        ),
    )

    # 3) (OPCIONAL) Quitar el server_default para futuras inserciones
    #   (si prefieres que en adelante se exija poner el valor manualmente)
    op.alter_column("usuarios", "tipo_usuario", server_default=None)


def downgrade() -> None:
    # 1) Eliminar la columna
    op.drop_column("usuarios", "tipo_usuario")

    # 2) Eliminar el tipo enumerado
    tipousuario_enum = postgresql.ENUM('superadmin', 'admin', 'empleado',
                                       name='tipousuario')
    tipousuario_enum.drop(op.get_bind(), checkfirst=True)
