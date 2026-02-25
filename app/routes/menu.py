from fastapi import APIRouter, HTTPException
from app.supabase import supabase  # ✅ استيراد من supabase.py
router = APIRouter()

@router.get("/menu/full/{slug}")
async def get_full_menu(slug: str):
    try:
        # 1️⃣ جلب المطعم
        res_restaurant = (
            supabase
            .table("restaurants")
            .select("*")
            .eq("slug", slug)
            .maybe_single()
            .execute()
        )
        restaurant = res_restaurant.data
        if not restaurant:
            raise HTTPException(status_code=404, detail="Restaurant not found")

        restaurant_id = restaurant["id"]

        # 2️⃣ جلب الفئات
        res_categories = (
            supabase
            .table("categories")
            .select("*")
            .eq("restaurant_id", restaurant_id)
            .order("sort_order", desc=False)
            .execute()
        )
        categories = res_categories.data or []

        # 3️⃣ جلب الأصناف
        res_items = (
            supabase
            .table("menu_items")
            .select("*")
            .eq("restaurant_id", restaurant_id)
            .execute()
        )
        items = res_items.data or []

        # 4️⃣ إعادة البيانات بالهيكل المطلوب
        return {
            "restaurant": restaurant,
            "categories": categories,
            "items": items
        }

    except HTTPException:
        raise
    except Exception as e:
        print("🔥 ERROR in /menu/full/{slug}:", e)
        raise HTTPException(status_code=500, detail="Internal Server Error")