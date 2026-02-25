FROM python:3.12-slim

# تثبيت المكتبات المطلوبة (libatomic1 و أدوات أخرى)
RUN apt-get update && apt-get install -y \
    libatomic1 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

RUN prisma generate

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]