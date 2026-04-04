from app.core.supabase_client import get_supabase_client
from supabase import Client

def get_db() -> Client:
    """Dependency for Supabase Client."""
    return get_supabase_client()
