import asyncio
from prisma import Prisma
import os
from dotenv import load_dotenv

load_dotenv()

async def test_connection():
    db = Prisma()
    try:
        print("🔄 محاولة الاتصال بقاعدة البيانات...")
        await db.connect()
        print("✅ Database connected successfully!")
        await db.disconnect()
        print("✅ Disconnected")
    except Exception as e:
        print(f"❌ Connection failed: {e}")

asyncio.run(test_connection())