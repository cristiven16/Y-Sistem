"""Nuevos cambios

Revision ID: 07b55d4d0a18
Revises: abc123_create_new_tables
Create Date: 2025-03-01 15:34:06.718098

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "07b55d4d0a18"
down_revision: Union[str, None] = "abc123_create_new_tables"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade():
    # 1) CLIENTES: Agrega columns dv, organizacion_id (nullable=True) 
    #    => no elimina constraints, no not null
    op.add_column("clientes", sa.Column("dv", sa.String(length=5), nullable=True))
    op.add_column("clientes", sa.Column("organizacion_id", sa.Integer(), nullable=True))
    # en tu script original se hacía `nullable=False`, lo cambiamos a True

    # No tocamos constraints de unique ni nada todavía
    # no drop constraints
    # no create FKs
    # si deseas, retiras o comentas op.alter_column("sucursal_id", ..., nullable=True)
    # si no choca, puedes dejarlo

    # 2) EMPLEADOS
    op.add_column("empleados", sa.Column("dv", sa.String(length=5), nullable=True))
    op.add_column("empleados", sa.Column("organizacion_id", sa.Integer(), nullable=True))
    # no constraints/fks yet

    # 3) ORGANIZACIONES (añadir columnas extra). 
    # la que dice "nombre_fiscal NOT NULL" la pones temporalmente nullable=True 
    op.add_column("organizaciones", sa.Column("tipo_documento_id", sa.Integer(), nullable=True))
    op.add_column("organizaciones", sa.Column("dv", sa.String(length=5), nullable=True))
    op.add_column("organizaciones", sa.Column("numero_documento", sa.String(), nullable=True))
    op.add_column("organizaciones", sa.Column("nombre_fiscal", sa.String(), nullable=True))  # no not null
    op.add_column("organizaciones", sa.Column("nombre_comercial", sa.String(), nullable=True))
    op.add_column("organizaciones", sa.Column("nombre_corto", sa.String(), nullable=True))
    op.add_column("organizaciones", sa.Column("obligado_contabilidad", sa.Boolean(), nullable=True))
    op.add_column("organizaciones", sa.Column("email_principal", sa.String(), nullable=True))
    op.add_column("organizaciones", sa.Column("email_alertas_facturacion", sa.String(), nullable=True))
    op.add_column("organizaciones", sa.Column("email_alertas_soporte", sa.String(), nullable=True))
    op.add_column("organizaciones", sa.Column("celular_whatsapp", sa.String(), nullable=True))
    op.add_column("organizaciones", sa.Column("pagina_web", sa.String(), nullable=True))
    op.add_column("organizaciones", sa.Column("encabezado_personalizado", sa.String(), nullable=True))
    op.add_column("organizaciones", sa.Column("dias_dudoso_recaudo", sa.Integer(), nullable=True))
    op.add_column("organizaciones", sa.Column("recibir_copia_email_documentos_electronicos", sa.Boolean(), nullable=True))
    op.add_column("organizaciones", sa.Column("politica_garantias", sa.String(), nullable=True))

    # 4) PROVEEDORES
    op.add_column("proveedores", sa.Column("dv", sa.String(length=5), nullable=True))
    op.add_column("proveedores", sa.Column("organizacion_id", sa.Integer(), nullable=True))
    # etc.

    # 5) SUCURSALES: añade columns pais, departamento_id, etc., con nullable=True
    op.add_column("sucursales", sa.Column("pais", sa.String(), nullable=True))
    op.add_column("sucursales", sa.Column("departamento_id", sa.Integer(), nullable=True))
    op.add_column("sucursales", sa.Column("ciudad_id", sa.Integer(), nullable=True))
    op.add_column("sucursales", sa.Column("direccion", sa.String(), nullable=True))
    op.add_column("sucursales", sa.Column("telefonos", sa.String(), nullable=True))
    op.add_column("sucursales", sa.Column("prefijo_transacciones", sa.String(), nullable=True))
    op.add_column("sucursales", sa.Column("sucursal_principal", sa.Boolean(), nullable=True))
    op.add_column("sucursales", sa.Column("activa", sa.Boolean(), nullable=True))

    # no FKs ni unique constraints por ahora
    # no drop column("organizaciones", "nombre") 
    #   - si no choca, puedes hacerlo, pero si esperas que sea not null, 
    #     mejor en la 2da migración

    pass


def downgrade():
    # Eliminar estas columnas en orden inverso
    # ...
    pass