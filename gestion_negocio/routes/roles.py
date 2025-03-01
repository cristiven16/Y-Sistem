from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models.roles import Rol
from models.organizaciones import Organizacion
from schemas.role_schemas import RoleCreate, RoleRead
from services.audit_service import log_event
from dependencies.auth import get_current_user

router = APIRouter(prefix="/roles", tags=["Roles"], dependencies=[Depends(get_current_user)])

@router.post("/", response_model=RoleRead)
def create_role(role_data: RoleCreate, 
                db: Session = Depends(get_db), 
                current_user=Depends(get_current_user)):
    """
    Crea un nuevo Rol. 
    Si 'organizacion_id' está presente, valida que exista la organización.
    """
    # Validar organizacion_id si se provee
    if role_data.organizacion_id is not None:
        org = db.query(Organizacion).filter(Organizacion.id == role_data.organizacion_id).first()
        if not org:
            raise HTTPException(status_code=400, detail="La organización especificada no existe.")

    rol = Rol(
        nombre=role_data.nombre,
        descripcion=role_data.descripcion,
        organizacion_id=role_data.organizacion_id
    )
    db.add(rol)
    db.commit()
    db.refresh(rol)

    log_event(db, current_user.id, "ROLE_CREATED", f"Rol {rol.nombre} creado (org_id={rol.organizacion_id})")
    return rol


@router.get("/{role_id}", response_model=RoleRead)
def get_role(role_id: int, 
             db: Session = Depends(get_db),
             current_user=Depends(get_current_user)):
    """
    Obtiene un Rol por su ID.
    """
    rol = db.query(Rol).filter(Rol.id == role_id).first()
    if not rol:
        raise HTTPException(status_code=404, detail="Rol no encontrado")
    return rol


@router.put("/{role_id}", response_model=RoleRead)
def update_role(role_id: int, 
                role_data: RoleCreate, 
                db: Session = Depends(get_db),
                current_user=Depends(get_current_user)):
    """
    Actualiza un Rol. 
    Maneja actualizaciones parciales si se quiere (usando exclude_unset).
    Valida organizacion_id si viene en la petición.
    """
    rol = db.query(Rol).filter(Rol.id == role_id).first()
    if not rol:
        raise HTTPException(status_code=404, detail="Rol no encontrado")

    fields = role_data.dict(exclude_unset=True)
    # Validar organizacion_id si viene
    if "organizacion_id" in fields and fields["organizacion_id"] is not None:
        org = db.query(Organizacion).filter(Organizacion.id == fields["organizacion_id"]).first()
        if not org:
            raise HTTPException(status_code=400, detail="La organización especificada no existe.")

    if "nombre" in fields:
        rol.nombre = fields["nombre"]
    if "descripcion" in fields:
        rol.descripcion = fields["descripcion"]
    if "organizacion_id" in fields:
        rol.organizacion_id = fields["organizacion_id"]

    db.commit()
    db.refresh(rol)

    log_event(db, current_user.id, "ROLE_UPDATED", f"Rol {rol.id} actualizado")
    return rol


@router.delete("/{role_id}")
def delete_role(role_id: int, 
                db: Session = Depends(get_db),
                current_user=Depends(get_current_user)):
    """
    Elimina un Rol por su ID.
    """
    rol = db.query(Rol).filter(Rol.id == role_id).first()
    if not rol:
        raise HTTPException(status_code=404, detail="Rol no encontrado")
    db.delete(rol)
    db.commit()

    log_event(db, current_user.id, "ROLE_DELETED", f"Rol {role_id} eliminado")
    return {"message": f"Rol {role_id} eliminado con éxito"}
