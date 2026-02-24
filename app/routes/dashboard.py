from fastapi import APIRouter, HTTPException
from app.services.dashboard_service import get_dashboard_summary_data

router = APIRouter()

@router.get("/dashboard/{restaurant_id}/summary")
async def get_dashboard_summary(restaurant_id: str):
    try:
        # استدعاء الخدمة لجلب الإحصائيات
        return await get_dashboard_summary_data(restaurant_id)

    except HTTPException:
        raise
    except Exception as e:
        print("🔥 ERROR in /dashboard/summary:", e)
        raise HTTPException(status_code=500, detail="Internal Server Error")