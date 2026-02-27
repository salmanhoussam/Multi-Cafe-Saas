# app/routes/upload.py
import os
import uuid
from dotenv import load_dotenv
from fastapi import APIRouter, HTTPException, Depends, UploadFile, File
from supabase import create_client, Client
from app.auth import get_current_user

# 🟢 إجبار مسح الذاكرة القديمة وقراءة المتغيرات الصحيحة دائماً
load_dotenv(override=True)

# نستخدم نفس الـ Prefix لكي لا نحتاج لتعديل الفرونت-إند
router = APIRouter(prefix="/api/admin", tags=["Uploads"])

# إعداد عميل Supabase Storage بمعزل عن باقي التطبيق
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

if SUPABASE_URL and SUPABASE_KEY:
    supabase_client: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
else:
    supabase_client = None


@router.post("/upload-image")
async def upload_image(
    file: UploadFile = File(...),
    manager: dict = Depends(get_current_user)
):
    print("\n🚀 --- بدء عملية الرفع من الملف المستقل ---")
    
    if not supabase_client:
        print("❌ فشل: متغيرات Supabase غير موجودة")
        raise HTTPException(500, "إعدادات خادم التخزين غير متوفرة")

    slug = manager.get("slug")
    if not slug:
        raise HTTPException(403, "غير مصرح")

    # تحديد المسار واسم الصورة
    file_extension = file.filename.split(".")[-1] if "." in file.filename else "png"
    unique_filename = f"{uuid.uuid4()}.{file_extension}"
    file_path = f"{slug}/categories/{unique_filename}"
    
    print(f"📌 جاري رفع الصورة إلى مسار: {file_path}")

    try:
        file_bytes = await file.read()
        
        # الرفع للباكت
        supabase_client.storage.from_("menu").upload(
            file_path, 
            file_bytes, 
            {"content-type": file.content_type}
        )
        
        # جلب الرابط وإعادته
        public_url = supabase_client.storage.from_("menu").get_public_url(file_path)
        print(f"✅ تمت العملية بنجاح! الرابط: {public_url}\n")
        
        return {"image_url": public_url}
        
    except Exception as e:
        print(f"🔥 خطأ أثناء الرفع: {e}")
        raise HTTPException(500, f"فشل رفع الصورة: {str(e)}")