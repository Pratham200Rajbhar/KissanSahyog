from supabase import create_client, Client
from app.core.config import settings

def get_supabase_client() -> Client:
    """
    Initialize and return a Supabase client using service role key.
    This bypasses RLS and should be used with caution for administrative tasks.
    """
    return create_client(settings.supabase_url, settings.supabase_service_role_key)
