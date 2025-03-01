from models.auditoria import AuditLog
from sqlalchemy.orm import Session

def log_event(db: Session, usuario_id: int, tipo_evento: str, detalle: str, ip_origen: str = None):
    log = AuditLog(
        usuario_id=usuario_id,
        tipo_evento=tipo_evento,
        detalle=detalle,
        ip_origen=ip_origen
    )
    db.add(log)
    db.commit()
    db.refresh(log)
    return log
