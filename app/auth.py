# app/routers/auth.py
from fastapi import APIRouter, HTTPException, Depends, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from app.database import db
import jwt
import os
from datetime import datetime, timedelta

router = APIRouter(prefix="/api/auth", tags=["Authentication"])
security = HTTPBearer()
SECRET_KEY = os.getenv("JWT_SECRET_KEY", "your-secret-key-must-be-at-least-32-bytes-long")

class LoginRequest(BaseModel):
    slug: str
    password: str

class LoginResponse(BaseModel):
    token: str
    restaurant_id: str
    restaurant_name: str
    slug: str
    manager_id: str

@router.post("/login", response_model=LoginResponse)
async def login(request: LoginRequest):
    try:
        restaurant = await db.restaurants.find_first(
            where={"slug": request.slug}
        )
        
        if not restaurant:
            raise HTTPException(status_code=401, detail="Invalid slug or password")
        
        # تحقق من كلمة المرور
        if restaurant.password != request.password:
            raise HTTPException(status_code=401, detail="Invalid slug or password")
        
        token = jwt.encode(
            {
                "restaurant_id": restaurant.id,
                "manager_id": restaurant.manager_id,
                "slug": restaurant.slug,
                "role": "manager",
                "exp": datetime.utcnow() + timedelta(days=7)
            },
            SECRET_KEY,
            algorithm="HS256"
        )
        
        return LoginResponse(
            token=token,
            restaurant_id=restaurant.id,
            restaurant_name=restaurant.name_en or restaurant.name_ar,
            slug=restaurant.slug,
            manager_id=restaurant.manager_id
        )
    except Exception as e:
        print(f"🔥 Login error: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

async def get_current_user(credentials: HTTPAuthorizationCredentials = Security(security)):
    token = credentials.credentials
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        return payload
    except jwt.PyJWTError:
        raise HTTPException(status_code=403, detail="Invalid token")