from fastapi import APIRouter, HTTPException
from app.schemas.chatbot import ChatRequest, ChatResponse
from app.services.chatbot_service import get_chatbot_reply

router = APIRouter(prefix="/chatbot", tags=["Chatbot"])

@router.post("/ask", response_model=ChatResponse)
async def ask_chatbot(request: ChatRequest):
    """
    Asks the Kissan Mitra AI for advice based on user query and current context.
    """
    try:
        reply = await get_chatbot_reply(request.message, request.context)
        return ChatResponse(
            reply=reply,
            context_used=request.context is not None
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
