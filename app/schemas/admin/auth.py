# app/schemas/admin/auth.py
from pydantic import BaseModel
from typing import Optional

# ==========================================
# 📑 نماذج تسجيل الدخول
# ==========================================

class LoginRequest(BaseModel):
    """
    نموذج طلب تسجيل الدخول
    """
    slug: str
    password: str

class LoginResponse(BaseModel):
    """
    نموذج رد تسجيل الدخول
    """
    token: str
    restaurant_id: str
    restaurant_name: str
    slug: str
    manager_id: str
    manager_phone: str

# ==========================================
# 📑 نماذج المطاعم (Restaurants)
# ==========================================

class RestaurantBase(BaseModel):
    """
    النموذج الأساسي للمطعم
    """
    name_ar: str
    name_en: str
    slug: str
    phone: Optional[str] = None
    manager_phone: str  # هذا هو المستخدم لتسجيل الدخول
    image_url: Optional[str] = None
    cover_image: Optional[str] = None
    is_active: bool = True

class RestaurantCreate(RestaurantBase):
    """
    نموذج إنشاء مطعم جديد
    """
    password: str = "admin"  # كلمة مرور افتراضية
    manager_id: Optional[str] = None  # يمكن توليدها تلقائياً

class RestaurantUpdate(BaseModel):
    """
    نموذج تحديث بيانات مطعم
    """
    name_ar: Optional[str] = None
    name_en: Optional[str] = None
    slug: Optional[str] = None
    phone: Optional[str] = None
    manager_phone: Optional[str] = None
    image_url: Optional[str] = None
    cover_image: Optional[str] = None
    is_active: Optional[bool] = None
    password: Optional[str] = None

class RestaurantOut(RestaurantBase):
    """
    نموذج عرض بيانات المطعم (للردود)
    """
    id: str
    manager_id: str
    created_at: Optional[str] = None
    
    class Config:
        from_attributes = True

# ==========================================
# 📑 نماذج المديرين (Admins) - بدون EmailStr
# ==========================================

class AdminLogin(BaseModel):
    """
    نموذج تسجيل دخول المدير العام (باستخدام رقم الهاتف)
    """
    phone: str  # استخدمنا phone بدلاً من EmailStr
    password: str

class AdminRegister(BaseModel):
    """
    نموذج تسجيل مدير عام جديد
    """
    phone: str  # استخدمنا phone بدلاً من EmailStr
    password: str
    full_name: str
    # يمكن إضافة email كحقل اختياري إذا أردت
    email: Optional[str] = None  

class AdminOut(BaseModel):
    """
    نموذج عرض بيانات المدير العام
    """
    id: str
    phone: str
    full_name: str
    email: Optional[str] = None
    is_superadmin: bool
    created_at: str
    
    class Config:
        from_attributes = True

# ==========================================
# 📑 نماذج التوكن (Token)
# ==========================================

class TokenPayload(BaseModel):
    """
    محتوى التوكن (JWT Payload)
    """
    restaurant_id: str
    manager_id: str
    slug: str
    manager_phone: str
    exp: int

class TokenResponse(BaseModel):
    """
    رد التوكن
    """
    access_token: str
    token_type: str = "bearer"
    restaurant: RestaurantOut