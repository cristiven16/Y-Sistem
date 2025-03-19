# gestion_negocio/services/proveedor_service.py

from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from models.proveedores import Proveedor
from models.organizaciones import Sucursal
from schemas.proveedores import ProveedorSchema
from services.common_validations import (
    validate_documento_unico,
    validate_sucursal_same_org
)
from services.dv_calculator import calc_dv_if_nit


async def create_proveedor(db: AsyncSession, data: ProveedorSchema) -> Proveedor:
    """
    Crea un nuevo proveedor de forma asíncrona.
    """
    # 1) Unicidad (organizacion_id, numero_documento)
    await validate_documento_unico(
        db=db,
        model_class=Proveedor,
        organizacion_id=data.organizacion_id,
        numero_documento=data.numero_documento
    )

    # 2) Verificar que la sucursal pertenece a la misma org
    await validate_sucursal_same_org(
        db=db,
        sucursal_id=data.sucursal_id,
        organizacion_id=data.organizacion_id,
        SucursalModel=Sucursal
    )

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
    await db.commit()
    await db.refresh(proveedor)
    return proveedor


async def update_proveedor(db: AsyncSession, proveedor_id: int, data: ProveedorSchema) -> Proveedor:
    """
    Actualiza un proveedor existente de forma asíncrona.
    - Verifica si cambia el número de documento => check unicidad.
    - Verifica la sucursal => misma org.
    - Recalcula DV si es NIT.
    """
    # 1) Obtener el proveedor
    stmt = (
        """ 
        SELECT p 
        FROM Proveedor p 
        WHERE p.id = :proveedor_id
        """
    )
    # En SQLAlchemy async, lo normal es usar select() en vez de un string,
    # pero ponemos esto como ejemplo si adaptaste 'validate_*' para asincronía.
    # O mejor directamente:
    from sqlalchemy import select
    query = select(Proveedor).where(Proveedor.id == proveedor_id)
    result = await db.execute(query)
    proveedor = result.scalars().first()

    if not proveedor:
        raise ValueError(f"Proveedor con ID={proveedor_id} no encontrado.")

    # Verificar si la organización cambió, etc. (si lo permites)
    if data.organizacion_id != proveedor.organizacion_id:
        # Podrías permitirlo o no.
        # Si lo permites, verificar la unicidad en la nueva org
        pass

    # 2) Si el numero_documento cambió => check unicidad
    if data.numero_documento != proveedor.numero_documento:
        await validate_documento_unico(
            db=db,
            model_class=Proveedor,
            organizacion_id=data.organizacion_id,
            numero_documento=data.numero_documento
        )

    # 3) Si sucursal_id cambió => validar org
    if data.sucursal_id is not None and data.sucursal_id != proveedor.sucursal_id:
        await validate_sucursal_same_org(
            db=db,
            sucursal_id=data.sucursal_id,
            organizacion_id=data.organizacion_id,
            SucursalModel=Sucursal
        )

    # 4) Recalcular DV si es NIT
    dv_calc = calc_dv_if_nit(data.tipo_documento_id, data.numero_documento)

    # 5) Actualizar los campos
    proveedor.tipo_documento_id = data.tipo_documento_id
    proveedor.numero_documento = data.numero_documento
    proveedor.dv = dv_calc
    proveedor.nombre_razon_social = data.nombre_razon_social
    proveedor.email = data.email
    proveedor.pagina_web = data.pagina_web
    proveedor.departamento_id = data.departamento_id
    proveedor.ciudad_id = data.ciudad_id
    proveedor.direccion = data.direccion
    proveedor.telefono1 = data.telefono1
    proveedor.telefono2 = data.telefono2
    proveedor.celular = data.celular
    proveedor.whatsapp = data.whatsapp
    proveedor.tipos_persona_id = data.tipos_persona_id
    proveedor.regimen_tributario_id = data.regimen_tributario_id
    proveedor.moneda_principal_id = data.moneda_principal_id
    proveedor.tarifa_precios_id = data.tarifa_precios_id
    proveedor.actividad_economica_id = data.actividad_economica_id
    proveedor.forma_pago_id = data.forma_pago_id
    proveedor.retencion_id = data.retencion_id
    proveedor.permitir_venta = data.permitir_venta
    proveedor.descuento = data.descuento
    proveedor.cupo_credito = data.cupo_credito
    proveedor.sucursal_id = data.sucursal_id
    proveedor.observacion = data.observacion

    await db.commit()
    await db.refresh(proveedor)
    return proveedor
