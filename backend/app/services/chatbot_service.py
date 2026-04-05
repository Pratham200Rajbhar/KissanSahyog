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
You are "Kissan Mitra", a premium AI Agronomy Expert for the KissanSahyog platform. 
Your goal is to provide high-quality, scientifically accurate, and empathetic advice to farmers.

{context_block}

Current User Query: {user_query}

Guidelines:
1. Be specific: If soil data (N, P, K, pH) is provided in the context, refer to it explicitly.
2. Be practical: Suggest organic and sustainable practices alongside modern techniques.
3. Be local: If location is known, consider the local climate and typical crops of that region in India.
4. Keep it concise but helpful. 
5. If the user asks something non-agricultural, politely steer them back to farming and rural welfare.
6. Use Markdown for formatting (bolding, lists).
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
    You are Kissan Mitra, an AI Agronomy Expert. 
    Explain the following {prediction_type} to a farmer. 
    
    Inputs provided by farmer:
    {input_data}
    
    Result produced by the system:
    {result}
    
    Requirements:
    1. Explain *why* this result was reached based on the inputs (refer to NPK, pH, climate if relevant).
    2. Provide 2-3 actionable tips for the farmer based on this result.
    3. Keep the tone encouraging, professional, and simple.
    4. Use Markdown formatting.
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
