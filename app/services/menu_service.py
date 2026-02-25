from app.database import db  # تأكد أن db هو عميل Prisma

async def get_menu_by_slug(slug: str):
    """
    هذه الدالة تجلب بيانات المطعم، الفئات، والأصناف من قاعدة البيانات
    """
    # 1. جلب المطعم
    restaurant = await db.restaurants.find_unique(
        where={"slug": slug, "is_active": True}
    )
    if not restaurant:
        return None

    restaurant_id = restaurant.id

    # 2. جلب الفئات
    categories = await db.categories.find_many(
        where={"restaurant_id": restaurant_id},
        order={"sort_order": "asc"}
    )

    # 3. جلب أصناف المنيو
    items = await db.menu_items.find_many(
        where={"restaurant_id": restaurant_id}
    )

    # 4. تجميع البيانات
    return {
        "restaurant": {
            "id": restaurant.id,
            "name_ar": restaurant.name_ar,
            "name_en": restaurant.name_en,
            "slug": restaurant.slug,
            "phone": restaurant.phone,
            "is_active": restaurant.is_active,
            "image_url": restaurant.image_url,
            "manager_id": restaurant.manager_id
        },
        "categories": [
            {
                "id": cat.id,
                "name_ar": cat.name_ar,
                "name_en": cat.name_en,
                "sort_order": cat.sort_order,
                "image_url": cat.image_url,
                "restaurant_id": cat.restaurant_id
            } for cat in categories
        ],
        "items": [
            {
                "id": item.id,
                "category_id": item.category_id,
                "name_ar": item.name_ar,
                "name_en": item.name_en,
                "description_ar": item.description_ar,
                "description_en": item.description_en,
                "price": float(item.price),
                "currency": item.currency,
                "image_url": item.image_url,
                "is_available": item.is_available
            } for item in items
        ]
    }