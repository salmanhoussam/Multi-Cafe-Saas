from pydantic import BaseModel
from typing import Optional

class MenuItem(BaseModel):
    id: str
    name_ar: str
    name_en: str
    price: float          # Prisma يستخدم Decimal، نحتاج تحويل
    currency: str = "$"
    image_url: Optional[str] = None

    class Config:
        # للسماح بالتحويل من كائن Prisma (الذي قد يحتوي على أسماء حقول مختلفة)
        from_attributes = True