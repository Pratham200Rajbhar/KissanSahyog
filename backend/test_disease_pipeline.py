import asyncio
import sys
import os
import io
from fastapi import UploadFile

# Add app to path
sys.path.append("/disk2/conv/backend")

from app.services.disease_service import detect_disease
from app.schemas.detect import DiseaseDetectionOutput

async def test_disease_detection():
    # Use any image for test
    image_path = "/disk2/conv/backend/.venv/lib/python3.11/site-packages/scipy/ndimage/tests/dots.png"
    
    if not os.path.exists(image_path):
        print(f"❌ Test image not found at {image_path}")
        return

    with open(image_path, "rb") as f:
        file_content = f.read()
        
    # Create a mock UploadFile
    mock_file = UploadFile(
        filename="test_image.png",
        file=io.BytesIO(file_content)
    )
    
    crop_type = "Brinjal"
    print(f"Testing disease detection for: {crop_type}")
    
    try:
        result = await detect_disease(mock_file, crop_type)
        print(f"✅ Detection Successful!")
        print(f"Detected Disease: {result.disease}")
        print(f"Confidence: {result.confidence:.2f}")
        print(f"Remedy: {result.remedy}")
    except Exception as e:
        print(f"❌ Detection Failed: {e}")

if __name__ == "__main__":
    import logging
    logging.basicConfig(level=logging.INFO)
    asyncio.run(test_disease_detection())
