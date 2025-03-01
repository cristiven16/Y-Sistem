"""Descripción de los cambios

Revision ID: 35c7877fd200
Revises: 116b198bc01e
Create Date: 2025-02-28 10:00:02.143508
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = "35c7877fd200"
down_revision: Union[str, None] = "116b198bc01e"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Si 'estadoorganizacion' YA existe, NO lo volvemos a crear
    # (Elimina este bloque si sabes que no hace falta)
    # estadoorganizacion_enum = postgresql.ENUM("activo", "inactivo", name="estadoorganizacion")
    # estadoorganizacion_enum.create(op.get_bind(), checkfirst=True)

    # Si 'estadousuario' NO existe, podemos crearlo:
    estadousuario_enum = postgresql.ENUM("activo", "bloqueado", "inactivo", name="estadousuario")
    estadousuario_enum.create(op.get_bind(), checkfirst=True)

    # Crear tabla 'organizaciones' (la columna 'estado' asume el tipo ya existe)
    op.create_table(
        "organizaciones",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("nombre", sa.String(), nullable=False),
        sa.Column(
            "estado",
            sa.Enum("activo", "inactivo", name="estadoorganizacion", create_type=False),
            nullable=False,
        ),
        sa.Column(
            "fecha_creacion",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=True,
        ),
        sa.Column("fecha_actualizacion", sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_organizaciones_id", "organizaciones", ["id"], unique=False)

    # Crear tabla 'planes'
    op.create_table(
        "planes",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("nombre_plan", sa.String(), nullable=False),
        sa.Column("max_usuarios", sa.Integer(), nullable=True),
        sa.Column("precio", sa.Float(), nullable=True),
        sa.Column(
            "fecha_creacion",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=True,
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("nombre_plan"),
    )
    op.create_index("ix_planes_id", "planes", ["id"], unique=False)

    # Crear tabla 'auditoria'
    op.create_table(
        "auditoria",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("usuario_id", sa.Integer(), nullable=True),
        sa.Column("tipo_evento", sa.String(), nullable=False),
        sa.Column("detalle", sa.Text(), nullable=True),
        sa.Column("ip_origen", sa.String(), nullable=True),
        sa.Column(
            "fecha_evento",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=True,
        ),
        sa.ForeignKeyConstraint(["usuario_id"], ["usuarios.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_auditoria_id", "auditoria", ["id"], unique=False)

    # Eliminar 'vendedor'
    op.drop_index("ix_vendedor_id", table_name="vendedor")
    op.drop_table("vendedor")

    # Modificar 'roles'
    op.add_column("roles", sa.Column("organizacion_id", sa.Integer(), nullable=True))
    op.add_column("roles", sa.Column("descripcion", sa.String(), nullable=True))
    op.add_column(
        "roles",
        sa.Column(
            "fecha_creacion",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=True,
        ),
    )
    op.drop_constraint("roles_nombre_key", "roles", type_="unique")
    op.create_foreign_key(None, "roles", "organizaciones", ["organizacion_id"], ["id"])

    # Modificar 'usuarios'
    op.add_column("usuarios", sa.Column("organizacion_id", sa.Integer(), nullable=True))
    op.add_column(
        "usuarios",
        sa.Column(
            "estado",
            sa.Enum("activo", "bloqueado", "inactivo", name="estadousuario", create_type=False),
            nullable=False,
            server_default="activo"
        ),
    )
    op.add_column("usuarios", sa.Column("tiene_mfa", sa.Boolean(), nullable=True))
    op.add_column(
        "usuarios",
        sa.Column(
            "fecha_creacion",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=True,
        ),
    )
    op.add_column(
        "usuarios",
        sa.Column("fecha_actualizacion", sa.DateTime(timezone=True), nullable=True),
    )
    op.create_foreign_key(None, "usuarios", "organizaciones", ["organizacion_id"], ["id"])


def downgrade() -> None:
    """Revertir los cambios."""
    # Quitas columnas y tablas en orden inverso.
    # Y si deseas, dropeas enums al final. Ajusta según tu caso.
    pass
