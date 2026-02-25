from fastapi import APIRouter, HTTPException
from app.services.menu_service import get_menu_by_slug
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

@router.get("/menu/full/{slug}")
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