"""Nuevos cambios

Revision ID: 064fe7a0fe83
Revises: 07b55d4d0a18
Create Date: 2025-03-01 15:53:21.855506

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "064fe7a0fe83"
down_revision: Union[str, None] = "07b55d4d0a18"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade():
    # 1) CLIENTES
    # rellena org_id si no hay
    op.execute("UPDATE clientes SET organizacion_id=1 WHERE organizacion_id IS NULL")
    # set not null
    op.alter_column("clientes", "organizacion_id",
        existing_type=sa.Integer(),
        nullable=False
    )
    # crea unique (org_id, numero_documento)
    op.drop_constraint("clientes_numero_documento_key", "clientes", type_="unique")
    op.create_unique_constraint("uq_cliente_org_doc", "clientes", ["organizacion_id","numero_documento"])
    # crea FK
    op.create_foreign_key("fk_clientes_org", "clientes", "organizaciones",
                          ["organizacion_id"], ["id"])

    # 2) EMPLEADOS
    op.execute("UPDATE empleados SET organizacion_id=1 WHERE organizacion_id IS NULL")
    op.alter_column("empleados", "organizacion_id",
        existing_type=sa.Integer(),
        nullable=False
    )
    op.drop_constraint("empleados_numero_documento_key", "empleados", type_="unique")
    op.create_unique_constraint("uq_empleado_org_doc", "empleados", ["organizacion_id","numero_documento"])
    op.create_foreign_key("fk_empleados_org", "empleados", "organizaciones",
                          ["organizacion_id"], ["id"])

    # 3) ORGANIZACIONES - si deseas not null en 'nombre_fiscal' y 'email_principal'
    op.execute("UPDATE organizaciones SET nombre_fiscal='SIN NOMBRE' WHERE nombre_fiscal IS NULL")
    op.alter_column("organizaciones", "nombre_fiscal", existing_type=sa.String(), nullable=False)

    op.execute("UPDATE organizaciones SET email_principal='info@ejemplo.com' WHERE email_principal IS NULL")
    op.alter_column("organizaciones", "email_principal", existing_type=sa.String(), nullable=False)

    # crear FK de tipo_documento_id => "tipo_documento"
    op.create_foreign_key("fk_org_tipo_doc", "organizaciones", "tipo_documento", ["tipo_documento_id"], ["id"])

    # 4) PROVEEDORES
    op.execute("UPDATE proveedores SET organizacion_id=1 WHERE organizacion_id IS NULL")
    op.alter_column("proveedores", "organizacion_id", existing_type=sa.Integer(), nullable=False)
    op.drop_constraint("proveedores_numero_documento_key", "proveedores", type_="unique")
    op.create_unique_constraint("uq_proveedor_org_doc", "proveedores", ["organizacion_id","numero_documento"])
    op.create_foreign_key("fk_proveedores_org", "proveedores", "organizaciones",
                          ["organizacion_id"], ["id"])

    # 5) SUCURSALES
    # si deseas not null en 'pais', 'departamento_id', etc., hazlo igual:
    op.execute("UPDATE sucursales SET pais='COLOMBIA' WHERE pais IS NULL")
    # ...
    op.alter_column("sucursales", "pais", existing_type=sa.String(), nullable=False)
    # si no quieres not null, no lo hagas

    # crea FKs a departamentos, ciudades
    op.create_foreign_key("fk_sucursales_depto", "sucursales", "departamentos", ["departamento_id"], ["id"])
    op.create_foreign_key("fk_sucursales_ciudad", "sucursales", "ciudades", ["ciudad_id"], ["id"])

    pass

def downgrade():
    # revertir ...
    pass