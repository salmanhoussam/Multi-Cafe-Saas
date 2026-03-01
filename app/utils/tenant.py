# app/utils/tenant.py
from fastapi import Request, HTTPException
from app.core.config import settings
from app.database import db
import logging
import re

logger = logging.getLogger(__name__)

async def get_restaurant_from_subdomain(request: Request) -> str:
    """
    استخراج slug المطعم من subdomain أو من query parameter
    """
    host = request.headers.get("host", "")
    logger.info(f"📡 Request host: {host}")
    
    # إزالة البورت إن وجد
    host_without_port = host.split(":")[0]
    
    # 1️⃣ أولاً: التحقق من وجود slug في query parameters (للتطوير)
    slug_from_query = request.query_params.get("slug") or request.query_params.get("restaurant")
    if slug_from_query:
        logger.info(f"🏪 Using slug from query parameter: {slug_from_query}")
        return slug_from_query
    
    # 2️⃣ ثانياً: التحقق من البيئة المحلية
    if host_without_port in settings.LOCAL_DOMAINS:
        # في التطوير المحلي بدون slug، نرجع خطأ مفيد
        logger.warning("⚠️ No slug provided in local development")
        raise HTTPException(
            status_code=400,
            detail="Please provide ?slug=restaurant_name in the URL for local development"
        )
    
    # 3️⃣ ثالثاً: استخراج slug من الدومين
    if host_without_port.endswith(settings.MAIN_DOMAIN):
        slug = host_without_port.replace(f".{settings.MAIN_DOMAIN}", "")
        
        if "." in slug:
            slug = slug.split(".")[0]
        
        logger.info(f"🏪 Extracted restaurant slug: {slug}")
        
        if re.match(r"^[a-zA-Z0-9-]+$", slug):
            return slug
    
    # 4️⃣ إذا لم نجد أي slug
    raise HTTPException(
        status_code=400, 
        detail="Restaurant slug is required. Use ?slug=name for local development or access via subdomain"
    )

async def verify_restaurant_exists(slug: str):
    """
    التحقق من وجود المطعم ونشاطه
    """
    restaurant = await db.restaurants.find_first(
        where={
            "slug": slug,
            "is_active": True
        }
    )
    
    if not restaurant:
        logger.warning(f"⚠️ Restaurant not found or inactive with slug: {slug}")
        raise HTTPException(status_code=404, detail=f"Restaurant '{slug}' not found")
    
    return restaurant