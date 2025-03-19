# services/audit_service.py

from models.auditoria import AuditLog
from sqlalchemy.ext.asyncio import AsyncSession

async def log_event(
    db: AsyncSession,
    usuario_id: int | None,  # Puede ser None, como en LOGIN_FAIL
    tipo_evento: str,
    detalle: str,
    ip_origen: str | None = None
):
    """
    Registra un evento de auditoría en la tabla AuditLog de manera asíncrona.
    
    :param db: AsyncSession para ejecutar operaciones asincrónicas con la BD.
    :param usuario_id: ID del usuario que desencadena el evento (o None si no aplica).
    :param tipo_evento: Etiqueta o categoría del evento (p.e. "LOGIN_OK", "LOGIN_FAIL").
    :param detalle: Mensaje o descripción detallada del evento.
    :param ip_origen: (Opcional) IP origen del evento, si se desea registrar.
    :return: El registro de auditoría recién creado (objeto AuditLog).
    """
    log_record = AuditLog(
        usuario_id=usuario_id,
        tipo_evento=tipo_evento,
        detalle=detalle,
        ip_origen=ip_origen
    )

    db.add(log_record)
    await db.commit()
    await db.refresh(log_record)
    return log_record
