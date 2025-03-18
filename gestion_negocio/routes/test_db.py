from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession # Importante usar AsyncSession
from sqlalchemy import text, exc  # Importa text y exc
from database import get_db   # Asegúrate de la ruta correcta
import logging

logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG) # Usa DEBUG para desarrollo
# No necesitas el handler si usas Cloud Run, ya lo gestiona.

router = APIRouter()

@router.get("/test-db")
async def test_db(db: AsyncSession = Depends(get_db)):  # Usa AsyncSession
    try:
        # Intenta ejecutar la consulta
        logger.debug("Intentando conectar a la base de datos...")
        result = await db.execute(text("SELECT 1")) # Usa AWAIT
        row = result.scalar() # Obtiene el valor escalar, ya no necesitamos .fetchone()

        if row == 1:
           return {"db_test": "Conexión exitosa", "value": row}
        else:
            logger.warning(f"Resultado inesperado de la DB: {row}")
            raise HTTPException(status_code=500, detail=f"Resultado inesperado: {row}")

    except exc.SQLAlchemyError as e:
      logger.error(f"Error de SQLAlchemy: {e}")
      raise HTTPException(status_code=500, detail=f"Error de base de datos: {e}") from e
    except Exception as e:
        logger.exception(f"Error inesperado en /test-db: {e}") #Captura TODO el traceback.
        raise HTTPException(status_code=500, detail=f"Error interno: {e}") from e