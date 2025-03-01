from fastapi import APIRouter
from dependencies.auth import get_current_user

router = APIRouter(prefix="/reportes", tags=["Reportes"], dependencies=[Depends(get_current_user)])

@router.get("/")
def generar_reporte():
    return {"message": "Generando reporte..."}
