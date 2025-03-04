import asyncio
from database import get_db  
# Asegúrate de que database.py está en la raíz del proyecto

async def test():
    async for session in get_db():
        print("✅ Conexión exitosa a PostgreSQL")

asyncio.run(test())
