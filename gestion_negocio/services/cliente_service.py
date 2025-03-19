# gestion_negocio/services/cliente_service.py

from typing import Optional, List

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.exc import NoResultFound

from models.clientes import Cliente
from models.organizaciones import Sucursal
from schemas.clientes import ClienteSchema
from services.common_validations import (
    validate_documento_unico,
    validate_sucursal_same_org
)
from services.dv_calculator import calc_dv_if_nit


async def create_cliente(db: AsyncSession, data: ClienteSchema) -> Cliente:
    """
    Crea un nuevo cliente, aplicando lógica de negocio:
      - Verifica unicidad (org_id, numero_documento).
      - Verifica si sucursal_id pertenece a la misma organización (si no es None).
      - Calcula DV si es NIT.
    """
    # 1) Verificar unicidad: (organizacion_id, numero_documento)
    await validate_documento_unico(
        db=db,
        model_class=Cliente,
        organizacion_id=data.organizacion_id,
        numero_documento=data.numero_documento
    )

    # 2) Verificar sucursal pertenece a la misma org (si data.sucursal_id existe)
    if data.sucursal_id is not None:
        await validate_sucursal_same_org(
            db=db,
            sucursal_id=data.sucursal_id,
            organizacion_id=data.organizacion_id,
            SucursalModel=Sucursal
        )

    # 3) Calcular DV si es NIT
    dv_calculado = calc_dv_if_nit(data.tipo_documento_id, data.numero_documento)

    # 4) Crear la instancia de Cliente
    nuevo_cliente = Cliente(
        tipo_documento_id=data.tipo_documento_id,
        organizacion_id=data.organizacion_id,
        numero_documento=data.numero_documento,
        dv=dv_calculado,
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
        tipo_marketing_id=data.tipo_marketing_id,
        sucursal_id=data.sucursal_id,
        ruta_logistica_id=data.ruta_logistica_id,
        vendedor_id=data.vendedor_id,
        observacion=data.observacion
    )
    db.add(nuevo_cliente)
    await db.commit()
    await db.refresh(nuevo_cliente)
    return nuevo_cliente


async def update_cliente(db: AsyncSession, cliente_id: int, data: ClienteSchema) -> Cliente:
    """
    Actualiza un cliente existente (full update).
      - Verifica si cambia numero_documento => verifica unicidad.
      - Verifica sucursal => misma org.
      - Recalcula DV si es NIT.
    """
    # Buscar el cliente con AsyncSession
    stmt = select(Cliente).where(Cliente.id == cliente_id)
    result = await db.execute(stmt)
    cliente = result.scalars().first()
    if not cliente:
        raise ValueError(f"Cliente con ID={cliente_id} no encontrado.")

    # Si la organización cambió, decidir si lo permites o no:
    if data.organizacion_id != cliente.organizacion_id:
        # Podrías permitirlo y volver a validar la unicidad en la nueva org
        pass

    # 1) Si el numero_documento cambió => check unicidad
    if data.numero_documento != cliente.numero_documento:
        await validate_documento_unico(
            db=db,
            model_class=Cliente,
            organizacion_id=data.organizacion_id,
            numero_documento=data.numero_documento
        )

    # 2) Si sucursal_id cambió => validar org
    if data.sucursal_id is not None and data.sucursal_id != cliente.sucursal_id:
        await validate_sucursal_same_org(
            db=db,
            sucursal_id=data.sucursal_id,
            organizacion_id=data.organizacion_id,
            SucursalModel=Sucursal
        )

    # 3) Recalcular DV si es NIT
    dv_calculado = calc_dv_if_nit(data.tipo_documento_id, data.numero_documento)

    # 4) Actualizar los campos
    cliente.tipo_documento_id = data.tipo_documento_id
    cliente.numero_documento = data.numero_documento
    cliente.dv = dv_calculado
    cliente.nombre_razon_social = data.nombre_razon_social
    cliente.email = data.email
    cliente.pagina_web = data.pagina_web
    cliente.departamento_id = data.departamento_id
    cliente.ciudad_id = data.ciudad_id
    cliente.direccion = data.direccion
    cliente.telefono1 = data.telefono1
    cliente.telefono2 = data.telefono2
    cliente.celular = data.celular
    cliente.whatsapp = data.whatsapp
    cliente.tipos_persona_id = data.tipos_persona_id
    cliente.regimen_tributario_id = data.regimen_tributario_id
    cliente.moneda_principal_id = data.moneda_principal_id
    cliente.tarifa_precios_id = data.tarifa_precios_id
    cliente.actividad_economica_id = data.actividad_economica_id
    cliente.forma_pago_id = data.forma_pago_id
    cliente.retencion_id = data.retencion_id
    cliente.permitir_venta = data.permitir_venta
    cliente.descuento = data.descuento
    cliente.cupo_credito = data.cupo_credito
    cliente.tipo_marketing_id = data.tipo_marketing_id
    cliente.sucursal_id = data.sucursal_id
    cliente.ruta_logistica_id = data.ruta_logistica_id
    cliente.vendedor_id = data.vendedor_id
    cliente.observacion = data.observacion

    await db.commit()
    await db.refresh(cliente)
    return cliente


async def get_cliente(db: AsyncSession, cliente_id: int) -> Optional[Cliente]:
    """
    Devuelve un cliente por su ID o None si no existe.
    """
    stmt = select(Cliente).where(Cliente.id == cliente_id)
    result = await db.execute(stmt)
    return result.scalars().first()


async def list_clientes(db: AsyncSession, organizacion_id: Optional[int] = None) -> List[Cliente]:
    """
    Lista todos los clientes. 
    Si se proporciona `organizacion_id`, filtra por esa organización.
    """
    stmt = select(Cliente)
    if organizacion_id is not None:
        stmt = stmt.where(Cliente.organizacion_id == organizacion_id)

    result = await db.execute(stmt)
    return result.scalars().all()
