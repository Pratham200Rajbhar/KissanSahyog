from fastapi import Request, HTTPException, Security
from fastapi.security import APIKeyCookie
from jose import jwe
import json
from app.core.config import settings
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.hkdf import HKDF
from typing import Dict, Any

# Define the cookie name. In development it's next-auth.session-token
# In production with secure cookies it might be __Secure-next-auth.session-token
# We can check both or just rely on the request cookies
cookie_sec = APIKeyCookie(name="__Secure-next-auth.session-token", auto_error=False)
cookie_dev = APIKeyCookie(name="next-auth.session-token", auto_error=False)

def get_nextauth_decryption_key(secret: str) -> bytes:
    """
    NextAuth uses HKDF (HMAC-based Extract-and-Expand Key Derivation Function)
    to derive the actual encryption key from the NEXTAUTH_SECRET.
    """
    hkdf = HKDF(
        algorithm=hashes.SHA256(),
        length=32,
        salt=b"",
        info=b"NextAuth.js Generated Encryption Key"
    )
    return hkdf.derive(secret.encode('utf-8'))

async def get_current_user(
    req: Request,
) -> Dict[str, Any]:
    
    # Try dev cookie first, then secure cookie
    token = req.cookies.get("next-auth.session-token") or req.cookies.get("__Secure-next-auth.session-token")
    
    if not token:
        raise HTTPException(status_code=401, detail="Authentication credentials were not provided (Missing Cookie)")

    secret = getattr(settings, "NEXTAUTH_SECRET", None)
    if not secret:
        # fallback to OS env if not in pydantic model
        import os
        secret = os.environ.get("NEXTAUTH_SECRET")
        if not secret:
            raise HTTPException(status_code=500, detail="NEXTAUTH_SECRET is not configured on the server")

    key = get_nextauth_decryption_key(secret)

    try:
        # Decrypt JWE token
        decrypted = jwe.decrypt(token, key)
        payload = json.loads(decrypted.decode('utf-8'))
        return payload
    except Exception as e:
        print(f"Token decryption failed: {e}")
        raise HTTPException(status_code=401, detail="Invalid authentication credentials")
