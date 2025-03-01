from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime, timedelta

from database import get_db
from models.organizaciones import Organizacion
from models.planes import Plan
from schemas.org_schemas import OrganizacionCreate, OrganizacionRead
from dependencies.auth import get_current_user
from services.audit_service import log_event
from services.dv_calculator import calc_dv_if_nit  # si calculas DV

router = APIRouter(prefix="/organizations", tags=["Organizations"], dependencies=[Depends(get_current_user)])

@router.post("/", response_model=OrganizacionRead)
def create_organization(
    data: OrganizacionCreate,
    db: Session = Depends(get_db)
):
    """
    Crea una nueva Organización, asignándole automáticamente
    un plan 'Lite' (o ID=1), con 15 días de prueba.
    """

    # 1) Lógica de DV si es NIT (opcional):
    dv_calculado = None
    if data.tipo_documento_id and data.numero_documento:
        dv_calculado = calc_dv_if_nit(data.tipo_documento_id, data.numero_documento)

    # 2) Buscar en la BD el plan 'Lite' o con ID=1
    plan_lite_id = 1  # si sabes que es ID=1
    plan_lite = db.query(Plan).filter(Plan.id == plan_lite_id).first()
    if not plan_lite:
        raise HTTPException(
            status_code=400,
            detail="No existe el plan Lite (ID=1). Revisa la base de datos."
        )

    # 3) Asignas las fechas de trial (15 días)
    fecha_inicio_plan = datetime.utcnow()
    fecha_fin_plan = fecha_inicio_plan + timedelta(days=15)
    trial_activo = True

    # 4) Creas la organización con TODOS los campos
    org = Organizacion(
        tipo_documento_id=data.tipo_documento_id,
        numero_documento=data.numero_documento,
        dv=dv_calculado,
        nombre_fiscal=data.nombre_fiscal,
        nombre_comercial=data.nombre_comercial,
        nombre_corto=data.nombre_corto,
        obligado_contabilidad=data.obligado_contabilidad,
        email_principal=data.email_principal,
        email_alertas_facturacion=data.email_alertas_facturacion,
        email_alertas_soporte=data.email_alertas_soporte,
        celular_whatsapp=data.celular_whatsapp,
        pagina_web=data.pagina_web,
        encabezado_personalizado=data.encabezado_personalizado,
        dias_dudoso_recaudo=data.dias_dudoso_recaudo,
        recibir_copia_email_documentos_electronicos=data.recibir_copia_email_documentos_electronicos,
        politica_garantias=data.politica_garantias,

        # Campos para ligar al plan
        plan_id=plan_lite.id,              # Referencia al plan 'Lite'
        fecha_inicio_plan=fecha_inicio_plan,
        fecha_fin_plan=fecha_fin_plan,
        trial_activo=trial_activo
    )

    db.add(org)
    db.commit()
    db.refresh(org)

    # Log de auditoría
    log_event(db, None, "ORG_CREATED", f"Organización {org.nombre_fiscal} creada con plan Lite")

    return org

@router.get("/{org_id}", response_model=OrganizacionRead)
def get_organization(org_id: int, db: Session = Depends(get_db)):
    """
    Obtiene la organización por ID.
    """
    org = db.query(Organizacion).filter(Organizacion.id == org_id).first()
    if not org:
        raise HTTPException(status_code=404, detail="Organización no encontrada")
    return org

@router.put("/{org_id}", response_model=OrganizacionRead)
def update_organization(org_id: int, data: OrganizacionCreate, db: Session = Depends(get_db)):
    """
    Actualiza los campos de una Organización existente, recalculando DV si cambia el NIT.
    """
    org = db.query(Organizacion).filter(Organizacion.id == org_id).first()
    if not org:
        raise HTTPException(status_code=404, detail="Organización no encontrada")

    fields = data.dict(exclude_unset=True)

    # Si tipo_documento_id y numero_documento vienen en la petición, recalculamos DV
    if "tipo_documento_id" in fields and "numero_documento" in fields:
        dv_calculado = calc_dv_if_nit(fields["tipo_documento_id"], fields["numero_documento"])
        org.dv = dv_calculado

    # Asignamos campo a campo si vienen en fields
    if "tipo_documento_id" in fields:
        org.tipo_documento_id = fields["tipo_documento_id"]
    if "numero_documento" in fields:
        org.numero_documento = fields["numero_documento"]
    if "nombre_fiscal" in fields:
        org.nombre_fiscal = fields["nombre_fiscal"]
    if "nombre_comercial" in fields:
        org.nombre_comercial = fields["nombre_comercial"]
    if "nombre_corto" in fields:
        org.nombre_corto = fields["nombre_corto"]
    if "obligado_contabilidad" in fields:
        org.obligado_contabilidad = fields["obligado_contabilidad"]
    if "email_principal" in fields:
        org.email_principal = fields["email_principal"]
    if "email_alertas_facturacion" in fields:
        org.email_alertas_facturacion = fields["email_alertas_facturacion"]
    if "email_alertas_soporte" in fields:
        org.email_alertas_soporte = fields["email_alertas_soporte"]
    if "celular_whatsapp" in fields:
        org.celular_whatsapp = fields["celular_whatsapp"]
    if "pagina_web" in fields:
        org.pagina_web = fields["pagina_web"]
    if "encabezado_personalizado" in fields:
        org.encabezado_personalizado = fields["encabezado_personalizado"]
    if "dias_dudoso_recaudo" in fields:
        org.dias_dudoso_recaudo = fields["dias_dudoso_recaudo"]
    if "recibir_copia_email_documentos_electronicos" in fields:
        org.recibir_copia_email_documentos_electronicos = fields["recibir_copia_email_documentos_electronicos"]
    if "politica_garantias" in fields:
        org.politica_garantias = fields["politica_garantias"]

    db.commit()
    db.refresh(org)

    log_event(db, None, "ORG_UPDATED", f"Organización {org.id} actualizada")
    return org

@router.delete("/{org_id}")
def delete_organization(org_id: int, db: Session = Depends(get_db)):
    """
    Elimina la Organización por ID.
    """
    org = db.query(Organizacion).filter(Organizacion.id == org_id).first()
    if not org:
        raise HTTPException(status_code=404, detail="Organización no encontrada")

    db.delete(org)
    db.commit()

    log_event(db, None, "ORG_DELETED", f"Organización {org_id} eliminada")
    return {"message": f"Organización {org_id} eliminada con éxito"}

#actualizar el plan de una organizacion
@router.put("/{org_id}/set_plan/{plan_id}")
def set_organization_plan(
    org_id: int,
    plan_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Asigna el plan con ID = plan_id a la organización org_id.
    Puede usarse para cambiar de plan o actualizar vigencia.
    """
    org = db.query(Organizacion).filter(Organizacion.id == org_id).first()
    if not org:
        raise HTTPException(status_code=404, detail="Organización no encontrada")

    plan = db.query(Plan).filter(Plan.id == plan_id).first()
    if not plan:
        raise HTTPException(status_code=404, detail="Plan no encontrado")

    # Asigna el plan
    org.plan_id = plan_id

    # (Opcional) si deseas resetear fechas de vigencia, trial, etc.
    # org.fecha_inicio_plan = datetime.utcnow()
    # org.fecha_fin_plan = datetime.utcnow() + timedelta(days=plan.duracion_dias or 30)
    # org.trial_activo = False  # etc.

    db.commit()
    db.refresh(org)

    log_event(db, current_user.id, "ORG_PLAN_UPDATED", f"Plan {plan.nombre_plan} asignado a org {org_id}")

    return {
        "message": f"Plan {plan.nombre_plan} asignado a la organización {org_id}",
        "plan": plan.nombre_plan
    }
