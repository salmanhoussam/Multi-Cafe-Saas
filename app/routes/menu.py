from fastapi import APIRouter, HTTPException
from app.services.menu_service import get_menu_by_slug

router = APIRouter()

@router.get("/menu/full/{slug}")
async def get_full_menu(slug: str):
    try:
        # استدعاء الخدمة (Service) التي تقوم بكل العمل الشاق
        menu_data = await get_menu_by_slug(slug)
        
        if not menu_data:
            raise HTTPException(status_code=404, detail="Restaurant not found")
            
        return menu_data

    except HTTPException:
        raise
    except Exception as e:
        print("🔥 ERROR in /menu/full/{slug}:", e)
        raise HTTPException(status_code=500, detail="Internal Server Error")