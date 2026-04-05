from google import genai
import logging
from typing import Dict, Any, Optional
from app.core.config import settings

logger = logging.getLogger(__name__)

# Initialize Gemini Client
try:
    # google-genai Client picks up api_key from constructor or environment
    client = genai.Client(api_key=settings.gemini_api_key)
except Exception as e:
    logger.error(f"Failed to initialize Gemini Client: {e}")
    client = None

# Using gemini-2.5-flash as requested by user
MODEL_NAME = "gemini-2.5-flash"

SYSTEM_PROMPT_TEMPLATE = """
You are "Kissan Mitra", a friendly and helpful Smart Farming Expert. 
Your goal is to help farmers grow better crops and earn more money using simple, easy-to-understand English.

{context_block}

Current Farmer's Question: {user_query}

Guidelines:
1. Use very simple English: Avoid big words or technical terms. Instead of "NPK concentrations", say "Soil health (Nitrogen, etc.)".
2. Be a helpful friend: Give practical, easy steps that any farmer can follow today.
3. Use local knowledge: If you know where the farmer is, talk about the local weather and crops.
4. Keep it short and clear. 
5. Use analogies: Explain things like how a plant needs food just like a person does.
6. Use simple formatting: Use bolding and bullets to make the answer easy to read.
7. Only talk about farming: If the user asks about other things, politely bring the talk back to helping their farm.
"""

async def get_chatbot_reply(message: str, context: Optional[Dict[str, Any]] = None) -> str:
    if not client:
        return "I'm sorry, my AI processing engine is currently offline. Please try again later."

    context_block = "No specific environmental context provided."
    if context:
        ctx_lines = ["Current Context:"]
        if context.get("state") or context.get("district"):
            ctx_lines.append(f"- Location: {context.get('district')}, {context.get('state')}")
        
        soil = []
        if context.get("nitrogen") is not None: soil.append(f"Nitrogen: {context['nitrogen']} mg/kg")
        if context.get("ph") is not None: soil.append(f"pH: {context['ph']}")
        if context.get("phosphorus") is not None: soil.append(f"Phosphorus: {context['phosphorus']} mg/kg")
        if context.get("potassium") is not None: soil.append(f"Potassium: {context['potassium']} mg/kg")
        
        if soil:
            ctx_lines.append("- Soil Parameters: " + ", ".join(soil))
            
        weather = []
        if context.get("temperature") is not None: weather.append(f"Temp: {context['temperature']}°C")
        if context.get("humidity") is not None: weather.append(f"Humidity: {context['humidity']}%")
        if weather:
            ctx_lines.append("- Weather: " + ", ".join(weather))
            
        if context.get("currentPage"):
            ctx_lines.append(f"- User is currently viewing: {context['currentPage']}")
            
        context_block = "\n".join(ctx_lines)

    full_prompt = SYSTEM_PROMPT_TEMPLATE.format(
        context_block=context_block,
        user_query=message
    )

    try:
        response = await client.aio.models.generate_content(
            model=MODEL_NAME,
            contents=full_prompt
        )
        return response.text
    except Exception as e:
        logger.error(f"Gemini API Error: {e}")
        try:
            logger.info("Retrying with gemini-2.0-flash...")
            response = await client.aio.models.generate_content(
                model="gemini-2.0-flash",
                contents=full_prompt
            )
            return response.text
        except Exception as retry_e:
            logger.error(f"Gemini Retry Error: {retry_e}")
            return "I encountered an error while processing your request. Please check your internet connection or try again shortly."

async def explain_prediction(prediction_type: str, input_data: Dict[str, Any], result: Any) -> str:
    """
    Generates a professional, easy-to-understand explanation for a specific prediction result.
    """
    if not client:
        return "Explanation currently unavailable."

    prompt = f"""
    You are Kissan Mitra, a friendly and helpful Smart Farming Expert. 
    Explain this {prediction_type} result to a farmer using very simple English.
    
    Details provided by the farmer:
    {input_data}
    
    The result found by our system:
    {result}
    
    Requirements:
    1. Explain *why* we got this result in a way a child could understand. Talk about soil health (N, P, K), the type of soil (pH), or the weather.
    2. Give 2-3 simple things the farmer can do right now based on this result.
    3. Be encouraging and use a friendly tone. No big technical words!
    4. Use Markdown (bold and bullets) to make it easy to read.
    """

    try:
        response = await client.aio.models.generate_content(
            model=MODEL_NAME,
            contents=prompt
        )
        return response.text
    except Exception as e:
        logger.error(f"Gemini Explanation Error: {e}")
        return "I could calculate the result, but I'm having trouble providing a detailed explanation right now. Please follow standard agricultural practices."
