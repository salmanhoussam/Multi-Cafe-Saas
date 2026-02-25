# app/supabase.py
from supabase import create_client
import os
from dotenv import load_dotenv

# تحميل متغيرات البيئة من ملف .env (للتطوير المحلي)
load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY")

if not SUPABASE_URL or not SUPABASE_ANON_KEY:
    raise ValueError("❌ Missing Supabase environment variables. Please set SUPABASE_URL and SUPABASE_ANON_KEY.")

# إنشاء عميل Supabase (مع anon key، يحترم RLS)
supabase = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)