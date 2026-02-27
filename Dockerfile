FROM python:3.12-slim

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1

RUN apt-get update && apt-get install -y --no-install-recommends libatomic1 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# نسخ مجلد prisma بالكامل (يحتوي على schema.prisma)
COPY prisma ./prisma

# توليد عميل Prisma
RUN prisma generate

COPY . .

EXPOSE ${PORT:-8000}

# استخدم exec form لـ CMD كما أوصى Docker
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]