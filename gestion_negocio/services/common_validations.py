# gestion_negocio/services/common_validations.py

from sqlalchemy.orm import Session

def validate_documento_unico(
    db: Session,
    model_class,
    organizacion_id: int,
    numero_documento: str
):
    """
    Verifica que NO exista un registro en 'model_class' (Cliente, Empleado, etc.)
    con la misma organizacion_id y numero_documento.
    Lanza ValueError si ya existe.
    """
    instance = (
        db.query(model_class)
        .filter_by(
            organizacion_id=organizacion_id,
            numero_documento=numero_documento
        )
        .first()
    )
    if instance:
        raise ValueError(
            f"El número de documento '{numero_documento}' "
            f"ya está registrado en la organización {organizacion_id}."
        )

def validate_sucursal_same_org(
    db: Session,
    sucursal_id: int,
    organizacion_id: int,
    SucursalModel
):
    """
    Verifica que la sucursal (sucursal_id) pertenezca
    a la misma organizacion_id.
    Lanza ValueError si no coincide o no existe.
    """
    sucursal = db.query(SucursalModel).filter_by(id=sucursal_id).one_or_none()
    if not sucursal:
        raise ValueError(f"No existe la sucursal con ID={sucursal_id}.")
    if sucursal.organizacion_id != organizacion_id:
        raise ValueError(
            f"La sucursal {sucursal_id} pertenece a otra organización "
            f"(ID {sucursal.organizacion_id}), no a {organizacion_id}."
        )
