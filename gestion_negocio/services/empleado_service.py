# gestion_negocio/services/empleado_service.py

from sqlalchemy.orm import Session
from typing import Optional
from models.empleados import Empleado
from models.organizaciones import Sucursal
from schemas.empleados import EmpleadoCreateUpdateSchema
from services.common_validations import validate_documento_unico, validate_sucursal_same_org
from services.dv_calculator import calc_dv_if_nit

def create_empleado(db: Session, data: EmpleadoCreateUpdateSchema) -> Empleado:
    # 1. Verificar que (organizacion_id, numero_documento) no exista
    validate_documento_unico(
        db=db,
        model_class=Empleado,
        organizacion_id=data.organizacion_id,
        numero_documento=data.numero_documento
    )

    # 2. Verificar sucursal es de la misma org
    validate_sucursal_same_org(
        db=db,
        sucursal_id=data.sucursal_id,
        organizacion_id=data.organizacion_id,
        SucursalModel=Sucursal
    )

    # 3. Calcular DV si es NIT
    dv = calc_dv_if_nit(data.tipo_documento_id, data.numero_documento)

    # 4. Crear la instancia
    empleado = Empleado(
        organizacion_id=data.organizacion_id,
        tipo_documento_id=data.tipo_documento_id,
        dv=dv,
        numero_documento=data.numero_documento,
        nombre_razon_social=data.nombre_razon_social,
        email=data.email,
        telefono1=data.telefono1,
        telefono2=data.telefono2,
        celular=data.celular,
        whatsapp=data.whatsapp,
        tipos_persona_id=data.tipos_persona_id,
        regimen_tributario_id=data.regimen_tributario_id,
        moneda_principal_id=data.moneda_principal_id,
        actividad_economica_id=data.actividad_economica_id,
        forma_pago_id=data.forma_pago_id,
        retencion_id=data.retencion_id,
        departamento_id=data.departamento_id,
        ciudad_id=data.ciudad_id,
        direccion=data.direccion,
        sucursal_id=data.sucursal_id,
        cargo=data.cargo,
        fecha_nacimiento=data.fecha_nacimiento,
        fecha_ingreso=data.fecha_ingreso,
        activo=data.activo,
        es_vendedor=data.es_vendedor,
        observacion=data.observacion
    )
    db.add(empleado)
    db.commit()
    db.refresh(empleado)
    return empleado
