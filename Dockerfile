FROM python:3.12-slim

# إعدادات البيئة
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1

# تثبيت الحزم النظامية الضرورية (libatomic1 قد تحتاجها Prisma)
RUN apt-get update && apt-get install -y --no-install-recommends libatomic1 \
    && rm -rf /var/lib/apt/lists/*

# تحديد مجلد العمل
WORKDIR /app

# نسخ ملف المتطلبات وتثبيت الاعتماديات أولاً (للاستفادة من الـ caching)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# نسخ ملفات Prisma أولاً لتوليد العميل (إذا تغيرت فقط، يُعاد تشغيل هذه الخطوة)
COPY prisma ./prisma
COPY schema.prisma ./
RUN prisma generate

# نسخ باقي ملفات المشروع
COPY . .

# المنفذ الذي سيستخدمه Railway (يُمرر عبر متغير PORT)
EXPOSE ${PORT:-8000}

# تشغيل التطبيق باستخدام exec form لاستقبال إشارات الإنهاء بشكل صحيح
CMD uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}