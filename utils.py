import os
import glob
import time
import logging
from typing import List

logger = logging.getLogger(__name__)

def cleanup_old_files(max_age_hours: int = 24) -> None:
    """Remove files older than specified hours"""
    try:
        current_time = time.time()
        max_age_seconds = max_age_hours * 3600
        
        patterns = ['output/*.mp4', 'output/*.mp3']
        
        for pattern in patterns:
            files = glob.glob(pattern)
            for file in files:
                if os.path.exists(file):
                    file_age = current_time - os.path.getctime(file)
                    if file_age > max_age_seconds:
                        os.remove(file)
                        logger.debug(f"Removed old file: {file}")
    except Exception as e:
        logger.error(f"Error cleaning up files: {str(e)}")
