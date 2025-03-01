"""Nuevos cambios

Revision ID: e44b3f635103
Revises: fa882fa15fcc
Create Date: 2025-03-01 15:19:22.305937

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "abc123_create_new_tables"
down_revision: Union[str, None] = "fa882fa15fcc"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade():
    # 1) Crear "centros_costos"
    op.create_table(
        "centros_costos",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("organizacion_id", sa.Integer(), nullable=False),
        sa.Column("codigo", sa.String(), nullable=False),
        sa.Column("nombre", sa.String(), nullable=False),
        sa.Column("nivel", sa.String(), nullable=True),
        sa.Column("padre_id", sa.Integer(), nullable=True),
        sa.Column("permite_ingresos", sa.Boolean(), nullable=True),
        sa.Column("estado", sa.Boolean(), nullable=True),
        sa.ForeignKeyConstraint(["organizacion_id"], ["organizaciones.id"]),
        sa.ForeignKeyConstraint(["padre_id"], ["centros_costos.id"]),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("codigo"),
    )

    # 2) "cuentas_bancarias"
    op.create_table(
        "cuentas_bancarias",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("organizacion_id", sa.Integer(), nullable=False),
        sa.Column("tipo_documento_id", sa.Integer(), nullable=True),
        sa.Column("numero_documento_titular", sa.String(), nullable=True),
        sa.Column("titular", sa.String(), nullable=False),
        sa.Column("banco", sa.String(), nullable=False),
        sa.Column("swift_bic", sa.String(), nullable=True),
        sa.Column("direccion_banco", sa.String(), nullable=True),
        sa.Column("tipo_cuenta", sa.String(), nullable=True),
        sa.Column("divisa_id", sa.Integer(), nullable=True),
        sa.Column("estado", sa.Boolean(), nullable=True),
        sa.Column("vigencia", sa.Boolean(), nullable=True),
        sa.Column("fecha_creacion", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
        sa.Column("responsable_creacion", sa.Integer(), nullable=True),
        sa.Column("fecha_modificacion", sa.DateTime(timezone=True), nullable=True),
        sa.Column("responsable_modificacion", sa.Integer(), nullable=True),
        sa.Column("fecha_anulacion", sa.DateTime(timezone=True), nullable=True),
        sa.Column("responsable_anulacion", sa.Integer(), nullable=True),
        sa.ForeignKeyConstraint(["divisa_id"], ["monedas.id"]),
        sa.ForeignKeyConstraint(["organizacion_id"], ["organizaciones.id"]),
        sa.ForeignKeyConstraint(["tipo_documento_id"], ["tipo_documento.id"]),
        sa.PrimaryKeyConstraint("id"),
    )

    # 3) "numeraciones_transaccion"
    op.create_table(
        "numeraciones_transaccion",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("organizacion_id", sa.Integer(), nullable=False),
        sa.Column("tipo_transaccion", sa.String(), nullable=True),
        sa.Column("nombre_personalizado", sa.String(), nullable=False),
        sa.Column("titulo_transaccion", sa.String(), nullable=False),
        sa.Column("mostrar_info_numeracion", sa.Boolean(), nullable=True),
        sa.Column("separador_prefijo", sa.String(), nullable=False),
        sa.Column("titulo_numeracion", sa.String(), nullable=True),
        sa.Column("longitud_numeracion", sa.Integer(), nullable=True),
        sa.Column("numeracion_por_defecto", sa.Boolean(), nullable=True),
        sa.Column("numero_resolucion", sa.String(), nullable=True),
        sa.Column("fecha_expedicion", sa.DateTime(timezone=True), nullable=True),
        sa.Column("fecha_vencimiento", sa.DateTime(timezone=True), nullable=True),
        sa.Column("prefijo", sa.String(), nullable=True),
        sa.Column("numeracion_inicial", sa.Integer(), nullable=False),
        sa.Column("numeracion_final", sa.Integer(), nullable=False),
        sa.Column("numeracion_siguiente", sa.Integer(), nullable=False),
        sa.Column("total_maximo_por_transaccion", sa.Integer(), nullable=True),
        sa.Column("transaccion_electronica", sa.Boolean(), nullable=True),
        sa.ForeignKeyConstraint(["organizacion_id"], ["organizaciones.id"]),
        sa.PrimaryKeyConstraint("id"),
    )

    # 4) "bodegas"
    op.create_table(
        "bodegas",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("organizacion_id", sa.Integer(), nullable=False),
        sa.Column("sucursal_id", sa.Integer(), nullable=False),
        sa.Column("nombre", sa.String(), nullable=False),
        sa.Column("bodega_por_defecto", sa.Boolean(), nullable=True),
        sa.Column("estado", sa.Boolean(), nullable=True),
        sa.ForeignKeyConstraint(["organizacion_id"], ["organizaciones.id"]),
        # asumes que 'sucursales' ya existe
        sa.ForeignKeyConstraint(["sucursal_id"], ["sucursales.id"]),
        sa.PrimaryKeyConstraint("id"),
    )

    # 5) "cajas"
    op.create_table(
        "cajas",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("organizacion_id", sa.Integer(), nullable=False),
        sa.Column("nombre", sa.String(), nullable=False),
        sa.Column("sucursal_id", sa.Integer(), nullable=False),
        sa.Column("estado", sa.Boolean(), nullable=True),
        sa.Column("vigencia", sa.Boolean(), nullable=True),
        sa.Column("fecha_creacion", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
        sa.Column("responsable_creacion", sa.Integer(), nullable=True),
        sa.Column("fecha_modificacion", sa.DateTime(timezone=True), nullable=True),
        sa.Column("responsable_modificacion", sa.Integer(), nullable=True),
        sa.Column("fecha_anulacion", sa.DateTime(timezone=True), nullable=True),
        sa.Column("responsable_anulacion", sa.Integer(), nullable=True),
        sa.ForeignKeyConstraint(["organizacion_id"], ["organizaciones.id"]),
        sa.ForeignKeyConstraint(["sucursal_id"], ["sucursales.id"]),
        sa.PrimaryKeyConstraint("id"),
    )

    # 6) "tiendas_virtuales"
    op.create_table(
        "tiendas_virtuales",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("organizacion_id", sa.Integer(), nullable=False),
        sa.Column("plataforma", sa.String(), nullable=True),
        sa.Column("nombre", sa.String(), nullable=False),
        sa.Column("url", sa.String(), nullable=True),
        sa.Column("centro_costo_id", sa.Integer(), nullable=True),
        sa.Column("estado", sa.Boolean(), nullable=True),
        sa.ForeignKeyConstraint(["centro_costo_id"], ["centros_costos.id"]),
        sa.ForeignKeyConstraint(["organizacion_id"], ["organizaciones.id"]),
        sa.PrimaryKeyConstraint("id"),
    )

    # no tocas “clientes”, “empleados”, “proveedores”, ni “organizaciones” 
    # (eso lo harás en Migración B).
    pass

def downgrade():
    # Borrar tablas en orden inverso
    op.drop_table("tiendas_virtuales")
    op.drop_table("cajas")
    op.drop_table("bodegas")
    op.drop_table("numeraciones_transaccion")
    op.drop_table("cuentas_bancarias")
    op.drop_table("centros_costos")
    pass