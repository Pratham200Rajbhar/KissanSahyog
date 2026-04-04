import logging
import json
import time
from typing import Dict, Any
from fastapi import Request, HTTPException
from fastapi.security import APIKeyCookie
from jose import jwe
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.hkdf import HKDF
from app.core.config import settings

logger = logging.getLogger(__name__)

# Primary cookie names for NextAuth
COOKIE_SECURE = "__Secure-next-auth.session-token"
COOKIE_DEV = "next-auth.session-token"

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

async def get_current_user(req: Request) -> Dict[str, Any]:
    """
    Decodes and verifies a NextAuth JWE session token.
    Raises HTTPException if the token is missing, invalid, or expired.
    """
    token = req.cookies.get(COOKIE_DEV) or req.cookies.get(COOKIE_SECURE)
    
    if not token:
        logger.warning(f"Unauthorized access attempt: No session token found.")
        raise HTTPException(status_code=401, detail="Authentication credentials were not provided")

    secret = settings.nextauth_secret
    if not secret:
        logger.error("System configuration error: NEXTAUTH_SECRET is not defined.")
        raise HTTPException(status_code=500, detail="Internal Server Error: Auth configuration missing.")

    try:
        # Decrypt JWE token using the derived key
        key = get_nextauth_decryption_key(secret)
        decrypted = jwe.decrypt(token, key)
        payload = json.loads(decrypted.decode('utf-8'))
        
        # Explicit check for token expiration
        # NextAuth includes 'exp' in the decrypted JSON
        exp = payload.get("exp")
        if exp and exp < time.time():
            logger.warning("Session expired for user.")
            raise HTTPException(status_code=401, detail="Session expired")
            
        return payload

    except Exception as e:
        logger.error(f"Authentication failure: {str(e)}")
        raise HTTPException(status_code=401, detail="Invalid session token")
