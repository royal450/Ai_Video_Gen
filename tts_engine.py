import os
import asyncio
import edge_tts
import logging
from datetime import datetime

logger = logging.getLogger(__name__)

async def generate_speech_async(text: str, voice: str) -> str:
    """Generate speech using Edge TTS"""
    try:
        communicate = edge_tts.Communicate(text, voice)
        
        # Generate unique filename
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        output_file = f"output/speech_{timestamp}.mp3"
        
        await communicate.save(output_file)
        return output_file
    except Exception as e:
        logger.error(f"Error generating speech: {str(e)}")
        raise Exception("Failed to generate speech")

def generate_speech(text: str, voice: str) -> str:
    """Synchronous wrapper for speech generation"""
    return asyncio.run(generate_speech_async(text, voice))
