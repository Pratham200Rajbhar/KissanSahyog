from pydantic import BaseModel
from typing import Dict, Any, Optional, List

class ChatRequest(BaseModel):
    message: str
    context: Optional[Dict[str, Any]] = None

class ChatMessage(BaseModel):
    role: str # 'user' or 'model'
    content: str

class ChatResponse(BaseModel):
    reply: str
    context_used: bool = False
