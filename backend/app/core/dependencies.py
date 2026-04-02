from fastapi import Header, HTTPException
from supabase import Client
from app.core.supabase_client import get_supabase_client
import jwt
from app.core.config import settings

def get_supabase() -> Client:
    """
    Dependency to provide a Supabase Client.
    """
    return get_supabase_client()

async def verify_jwt(authorization: str = Header(None)):
    """
    Dependency to verify a Supabase JWT token.
    MODIFIED: In Dev Mode, returns a mock user if no token is provided.
    """
    if not authorization:
        # BYPASS: Return mock user for local testing
        return {"sub": "dev-user-id", "email": "dev@agriai.com", "role": "authenticated"}
    
    if authorization.startswith("Bearer "):
        token = authorization.split(" ")[1]
    else:
        token = authorization

    if not settings.supabase_jwt_secret:
        raise HTTPException(status_code=500, detail="SUPABASE_JWT_SECRET not configured")

    try:
        decoded_token = jwt.decode(
            token, 
            settings.supabase_jwt_secret, 
            algorithms=["HS256"], 
            audience="authenticated"
        )
        return decoded_token
    except jwt.ExpiredSignatureError:
        # BYPASS: Still allow expired tokens in dev mode
        return {"sub": "dev-user-expired", "email": "dev@agriai.com", "role": "authenticated", "expired": True}
    except jwt.InvalidTokenError:
        # BYPASS: Allow invalid tokens in dev mode
        return {"sub": "dev-user-invalid", "email": "dev@agriai.com", "role": "authenticated", "invalid": True}
