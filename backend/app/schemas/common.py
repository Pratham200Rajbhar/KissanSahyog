from pydantic import BaseModel
from typing import Any, Optional

class BaseResponse(BaseModel):
    status: str = "success"
    message: Optional[str] = None
    data: Optional[Any] = None

class ErrorResponse(BaseModel):
    error: str
    status_code: int
