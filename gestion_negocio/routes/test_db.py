from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from database import get_db  # Asegúrate de que database.py tiene el código correcto

router = APIRouter()

@router.get("/test-db")
async def test_db(db: AsyncSession = Depends(get_db)):
    try:
        # USA AWAIT con las operaciones de la sesión
        result = await db.execute(text("SELECT 1"))
        scalar_result = result.scalar()
        return {"message": f"Database connection successful! Result: {scalar_result}"}
    except Exception as e:
        return {"message": f"Database connection failed: {e}"}