# gestion_negocio/services/common_validations.py

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select


async def validate_documento_unico(
    db: AsyncSession,
    model_class,
    organizacion_id: int,
    numero_documento: str
):
    """
    Verifica que NO exista un registro en 'model_class' (Cliente, Empleado, etc.)
    con la misma organizacion_id y numero_documento.
    Lanza ValueError si ya existe.
    """
    stmt = (
        select(model_class)
        .where(model_class.organizacion_id == organizacion_id)
        .where(model_class.numero_documento == numero_documento)
    )
    result = await db.execute(stmt)
    instance = result.scalars().first()

    if instance:
        raise ValueError(
            f"El número de documento '{numero_documento}' "
            f"ya está registrado en la organización {organizacion_id}."
        )


async def validate_sucursal_same_org(
    db: AsyncSession,
    sucursal_id: int,
    organizacion_id: int,
    SucursalModel
):
    """
    Verifica que la sucursal (sucursal_id) pertenezca
    a la misma organizacion_id.
    Lanza ValueError si no coincide o no existe.
    """
    stmt = select(SucursalModel).where(SucursalModel.id == sucursal_id)
    result = await db.execute(stmt)
    sucursal = result.scalars().first()

    if not sucursal:
        raise ValueError(f"No existe la sucursal con ID={sucursal_id}.")

    if sucursal.organizacion_id != organizacion_id:
        raise ValueError(
            f"La sucursal {sucursal_id} pertenece a otra organización "
            f"(ID {sucursal.organizacion_id}), no a {organizacion_id}."
        )
