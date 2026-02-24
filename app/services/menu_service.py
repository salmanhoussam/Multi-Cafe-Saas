from app.database import db

async def get_menu_by_slug(slug: str):
    """
    هذه الدالة تجلب بيانات المطعم، الفئات، والأصناف من قاعدة البيانات
    """
    # 1. جلب المطعم
    restaurant = await db.restaurant.find_first(
        where={"slug": slug}
    )
    if not restaurant:
        return None  # إذا لم يجد المطعم، نرجع None

    restaurant_id = restaurant.id

    # 2. جلب الفئات
    categories = await db.category.find_many(
        where={"restaurantId": restaurant_id},
        order={"sortOrder": "asc"}
    )

    # 3. جلب أصناف المنيو
    items = await db.menuitem.find_many(
        where={"restaurantId": restaurant_id}
    )

    # 4. تجميع البيانات للفرونت إند
    return {
        "restaurant": {
            "id": restaurant.id,
            "name_ar": restaurant.nameAr,
            "name_en": restaurant.nameEn,
            "slug": restaurant.slug,
            "phone": restaurant.phone,
            "is_active": restaurant.isActive,
            "image_url": restaurant.imageUrl,
            "manager_id": restaurant.managerId
        },
        "categories": [
            {
                "id": cat.id,
                "name_ar": cat.nameAr,
                "name_en": cat.nameEn,
                "sort_order": cat.sortOrder,
                "image_url": cat.imageUrl,
                "restaurant_id": cat.restaurantId
            } for cat in categories
        ],
        "items": [
            {
                "id": item.id,
                "category_id": item.categoryId, # 👈 أضف هذا السطر
                "name_ar": item.nameAr,
                "name_en": item.nameEn,
                "description_ar": item.descriptionAr, # 👈 أضف هذا السطر
                "description_en": item.descriptionEn, # 👈 أضف هذا السطر
                "price": float(item.price),
                "currency": item.currency,
                "image_url": item.imageUrl
            } for item in items
        ]
    }