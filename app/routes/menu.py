from fastapi import APIRouter, HTTPException
from app.services.menu_service import get_menu_by_slug
from app.schemas.menu import FullMenuOut # استيراد الـ Schema
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

# ربطنا الـ response_model بالـ Route
@router.get("/menu/full/{slug}", response_model=FullMenuOut)
async def get_full_menu(slug: str):
    try:
        data = await get_menu_by_slug(slug)
        if data is None:
            raise HTTPException(status_code=404, detail="Restaurant not found")
        return data
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"🔥 ERROR in /menu/full/{slug}: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal Server Error")