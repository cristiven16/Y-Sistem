# gestion_negocio/routes/test_db.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text, exc
from database import get_db  # Asegúrate de que esto esté importando correctamente
import logging

# Configura logging (ajusta el nivel según sea necesario)
logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)  # Para depuración, usa INFO en producción
handler = logging.StreamHandler()  # Envía logs a la consola (Cloud Run los capturará)
formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
handler.setFormatter(formatter)
logger.addHandler(handler)


router = APIRouter()

@router.get("/test-db")
async def test_db(db: Session = Depends(get_db)):  #  <--  ¡Añade 'async' aquí!
    """
    Este endpoint ejecuta un SELECT 1 en la base de datos
    para comprobar la conexión, usando await para operaciones asíncronas.
    """
    try:
        # Intenta ejecutar la consulta
        logger.debug("Intentando conectar a la base de datos...")
        result = await db.execute(text("SELECT 1"))  # <-- ¡Añade 'await' aquí!
        row = result.fetchone()  # <--  fetchone() ahora se llama en el resultado, no en la corutina.
        logger.debug(f"Consulta exitosa: {row}")

        # Verifica si el resultado es el esperado
        if row and row[0] == 1:
            return {"db_test": "Conexión exitosa", "value": row[0]}
        else:
             logger.warning(f"Resultado inesperado de la base de datos: {row}")
             raise HTTPException(status_code=500, detail="Resultado inesperado de la base de datos")


    except exc.SQLAlchemyError as e:
        # Captura cualquier error de SQLAlchemy (conexión, consulta, etc.)
        logger.error(f"Error de SQLAlchemy: {e}")
        raise HTTPException(status_code=500, detail=f"Error de base de datos: {e}") from e

    except Exception as e:
        # Captura cualquier otro error
        logger.exception(f"Error inesperado en /test-db: {e}")  # Usa exception para incluir el traceback
        raise HTTPException(status_code=500, detail=f"Error interno del servidor: {e}") from e