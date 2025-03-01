"""Agrega organizacion_id en varias tablas con dos pasos (nullable=True -> update -> not null),
   y renombra la tabla 'sucursal' -> 'sucursales'.
   Adicionalmente, crea la FK a 'organizaciones'.
   Adapta este archivo según tus necesidades.
"""

from alembic import op
import sqlalchemy as sa


# Identificadores de la migración
revision = "fa882fa15fcc"
down_revision = "8a54bb11af70"
branch_labels = None
depends_on = None


def upgrade():
    # 1) Renombrar la tabla 'sucursal' -> 'sucursales'
    op.rename_table("sucursal", "sucursales")

    # (Opcional) Si existía un índice en la antigua 'sucursal'
    # op.drop_index("ix_sucursal_id", table_name="sucursal",  ...)
    op.create_index("ix_sucursales_id", "sucursales", ["id"], unique=False)

    # 2) Agregar organizacion_id en 'sucursales'
    op.add_column("sucursales", sa.Column("organizacion_id", sa.Integer(), nullable=True))
    # Rellena la columna en las filas existentes (ejemplo, usar 1 o lo que convenga)
    op.execute("UPDATE sucursales SET organizacion_id = 1 WHERE organizacion_id IS NULL")
    # Ahora cambiar a NOT NULL
    op.alter_column("sucursales", "organizacion_id", existing_type=sa.Integer(), nullable=False)
    # Crear la FK
    op.create_foreign_key(
        "fk_sucursales_org",
        "sucursales",
        "organizaciones",
        ["organizacion_id"],
        ["id"]
    )

    # 3) CLIENTES
    # A) Agregar la columna con nullable=True
    op.add_column("clientes", sa.Column("organizacion_id", sa.Integer(), nullable=True))
    # B) Rellenar filas antiguas
    op.execute("UPDATE clientes SET organizacion_id = 1 WHERE organizacion_id IS NULL")
    # C) Alter a not null
    op.alter_column("clientes", "organizacion_id", existing_type=sa.Integer(), nullable=False)
    # D) Crear la FK
    op.create_foreign_key("fk_clientes_org", "clientes", "organizaciones",
                          ["organizacion_id"], ["id"])

    # 4) EMPLEADOS
    op.add_column("empleados", sa.Column("organizacion_id", sa.Integer(), nullable=True))
    op.execute("UPDATE empleados SET organizacion_id = 1 WHERE organizacion_id IS NULL")
    op.alter_column("empleados", "organizacion_id", existing_type=sa.Integer(), nullable=False)
    op.create_foreign_key("fk_empleados_org", "empleados", "organizaciones",
                          ["organizacion_id"], ["id"])

    # 5) PROVEEDORES
    op.add_column("proveedores", sa.Column("organizacion_id", sa.Integer(), nullable=True))
    op.execute("UPDATE proveedores SET organizacion_id = 1 WHERE organizacion_id IS NULL")
    op.alter_column("proveedores", "organizacion_id", existing_type=sa.Integer(), nullable=False)
    op.create_foreign_key("fk_proveedores_org", "proveedores", "organizaciones",
                          ["organizacion_id"], ["id"])

    # Si necesitas hacer lo mismo con otras tablas (bodegas, etc.), repite el patrón:
    #  - add_column (nullable=True)
    #  - UPDATE ... SET ... = 1
    #  - alter_column -> not null
    #  - create_foreign_key
    # ...
    pass


def downgrade():
    # Revertir los cambios: 
    # 1) Borrar FK, set nullable=True, drop column, rename back 'sucursales' -> 'sucursal', etc.
    # Ajusta según quieras revertir la migración.
    
    # Ejemplo:
    op.drop_constraint("fk_sucursales_org", "sucursales", type_="foreignkey")
    op.alter_column("sucursales", "organizacion_id", existing_type=sa.Integer(), nullable=True)
    op.drop_column("sucursales", "organizacion_id")

    op.drop_index("ix_sucursales_id", table_name="sucursales")
    op.rename_table("sucursales", "sucursal")

    op.drop_constraint("fk_clientes_org", "clientes", type_="foreignkey")
    op.alter_column("clientes", "organizacion_id", existing_type=sa.Integer(), nullable=True)
    op.drop_column("clientes", "organizacion_id")

    op.drop_constraint("fk_empleados_org", "empleados", type_="foreignkey")
    op.alter_column("empleados", "organizacion_id", existing_type=sa.Integer(), nullable=True)
    op.drop_column("empleados", "organizacion_id")

    op.drop_constraint("fk_proveedores_org", "proveedores", type_="foreignkey")
    op.alter_column("proveedores", "organizacion_id", existing_type=sa.Integer(), nullable=True)
    op.drop_column("proveedores", "organizacion_id")

    pass
