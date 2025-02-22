from fastapi import APIRouter

router = APIRouter(prefix="/reportes", tags=["Reportes"])

@router.get("/")
def generar_reporte():
    return {"message": "Generando reporte..."}
