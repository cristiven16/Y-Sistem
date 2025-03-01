# gestion_negocio/services/proveedor_service.py

from sqlalchemy.orm import Session
from typing import Optional
from models.proveedores import Proveedor
from models.organizaciones import Sucursal
from schemas.proveedores import ProveedorSchema
from services.common_validations import validate_documento_unico, validate_sucursal_same_org
from services.dv_calculator import calc_dv_if_nit

def create_proveedor(db: Session, data: ProveedorSchema) -> Proveedor:
    # 1) Unicidad (organizacion_id, numero_documento)
    validate_documento_unico(db, Proveedor, data.organizacion_id, data.numero_documento)

    # 2) Verificar sucursal
    validate_sucursal_same_org(db, data.sucursal_id, data.organizacion_id, Sucursal)

    # 3) Calcular DV si es NIT
    dv = calc_dv_if_nit(data.tipo_documento_id, data.numero_documento)

    # 4) Crear la instancia
    proveedor = Proveedor(
        organizacion_id=data.organizacion_id,
        tipo_documento_id=data.tipo_documento_id,
        dv=dv,
        numero_documento=data.numero_documento,
        nombre_razon_social=data.nombre_razon_social,
        email=data.email,
        pagina_web=data.pagina_web,
        departamento_id=data.departamento_id,
        ciudad_id=data.ciudad_id,
        direccion=data.direccion,
        telefono1=data.telefono1,
        telefono2=data.telefono2,
        celular=data.celular,
        whatsapp=data.whatsapp,
        tipos_persona_id=data.tipos_persona_id,
        regimen_tributario_id=data.regimen_tributario_id,
        moneda_principal_id=data.moneda_principal_id,
        tarifa_precios_id=data.tarifa_precios_id,
        actividad_economica_id=data.actividad_economica_id,
        forma_pago_id=data.forma_pago_id,
        retencion_id=data.retencion_id,
        permitir_venta=data.permitir_venta,
        descuento=data.descuento,
        cupo_credito=data.cupo_credito,
        sucursal_id=data.sucursal_id,
        observacion=data.observacion
    )
    db.add(proveedor)
    db.commit()
    db.refresh(proveedor)
    return proveedor

def update_proveedor(db: Session, proveedor_id: int, data: ProveedorSchema) -> Proveedor:
    # ...
    pass  # Similar a create_proveedor, ajustando la lógica de actualización
