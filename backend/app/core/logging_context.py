import uuid
from contextvars import ContextVar
from typing import Optional

# Context variables for request-scoped tracking
_request_id_ctx: ContextVar[Optional[str]] = ContextVar("request_id", default=None)
_user_email_ctx: ContextVar[Optional[str]] = ContextVar("user_email", default=None)

def set_request_id(request_id: Optional[str] = None) -> str:
    """Sets the current request ID or generates a new one."""
    val = request_id or str(uuid.uuid4())
    _request_id_ctx.set(val)
    return val

def get_request_id() -> Optional[str]:
    """Retrieves the current request ID."""
    return _request_id_ctx.get()

def set_user_identity(email: Optional[str]) -> None:
    """Sets the current user's email in the logging context."""
    _user_email_ctx.set(email)

def get_user_identity() -> Optional[str]:
    """Retrieves the current user's email from the logging context."""
    return _user_email_ctx.get()

def get_logging_context() -> dict:
    """Returns all contextual data for the current logger."""
    return {
        "request_id": get_request_id(),
        "user_email": get_user_identity()
    }
