from fastapi import APIRouter, Depends
from app.core.security import get_current_user
from typing import Dict, Any

router = APIRouter(
    prefix="/protected",
    tags=["Authentication Test"]
)

@router.get("")
async def protected_route(user: Dict[str, Any] = Depends(get_current_user)):
    """
    This endpoint requires a valid NextAuth Google session token.
    It returns the decoded JWT payload of the authenticated user.
    """
    return {
        "status": "success",
        "message": "You have accessed a protected route!",
        "user_data": user
    }
