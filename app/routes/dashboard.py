from fastapi import APIRouter, HTTPException, Depends, Security
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from app.services.dashboard_service import get_dashboard_summary_data
import jwt
import os

router = APIRouter()
security = HTTPBearer()
SECRET_KEY = os.getenv("JWT_SECRET_KEY", "your-secret-key-please-change")

async def get_current_user(credentials: HTTPAuthorizationCredentials = Security(security)):
    token = credentials.credentials
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        return payload
    except jwt.PyJWTError:
        raise HTTPException(status_code=403, detail="Invalid token")

@router.get("/dashboard/{restaurant_id}/summary")
async def get_dashboard_summary(
    restaurant_id: str,
    user: dict = Depends(get_current_user)
):
    # تأكد أن المستخدم يحاول الوصول إلى مطعمه فقط
    if user.get("restaurant_id") != restaurant_id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    try:
        return await get_dashboard_summary_data(restaurant_id)
    except HTTPException:
        raise
    except Exception as e:
        print("🔥 ERROR in /dashboard/summary:", e)
        raise HTTPException(status_code=500, detail="Internal Server Error")