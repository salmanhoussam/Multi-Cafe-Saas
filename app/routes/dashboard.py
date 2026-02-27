# app/routers/dashboard.py
from fastapi import APIRouter, HTTPException, Depends
from app.services.dashboard_service import get_dashboard_summary_data
from app.auth import get_current_user

# ✅ تم تعديل الـ prefix ليطابق الفرونت إند
router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])

# ✅ تم إزالة {restaurant_id} من الرابط
@router.get("/summary")
async def get_dashboard_summary(
    user: dict = Depends(get_current_user)
):
    # ✅ استخراج restaurant_id مباشرة من التوكن
    restaurant_id = user.get("restaurant_id")
    
    if not restaurant_id:
        raise HTTPException(status_code=403, detail="Access denied: No restaurant linked to this token")
    
    try:
        return await get_dashboard_summary_data(restaurant_id)
    except HTTPException:
        raise
    except Exception as e:
        print("🔥 ERROR in /dashboard/summary:", e)
        raise HTTPException(status_code=500, detail="Internal Server Error")