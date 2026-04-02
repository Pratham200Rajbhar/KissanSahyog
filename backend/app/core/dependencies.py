from fastapi import Header, HTTPException
from supabase import Client
from app.core.supabase_client import get_supabase_client
from app.core.config import settings

def get_supabase() -> Client:
    """
    Dependency to provide a Supabase Client.
    """
    return get_supabase_client()
