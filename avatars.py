import random
import logging
import requests
from typing import List

# Configure logging
logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.DEBUG)

# Available DiceBear styles (removed unavailable styles)
AVATAR_STYLES = ['avataaars', 'bottts']

def get_random_avatars(count: int = 20) -> List[str]:
    """Generate a list of random avatar URLs using DiceBear API."""
    avatars = []

    for _ in range(count):
        style = random.choice(AVATAR_STYLES)
        seed = random.randint(1, 1000000)
        url = f"https://api.dicebear.com/7.x/{style}/svg?seed={seed}"

        logger.debug(f"Generated Avatar URL: {url}")

        try:
            response = requests.head(url, timeout=5)  # Check if the URL is valid
            if response.status_code == 200:
                logger.debug(f"Valid avatar: {url}")
                avatars.append(url)
            else:
                logger.warning(f"Invalid avatar: {url}, Status Code: {response.status_code}")
        except requests.exceptions.RequestException as e:
            logger.error(f"Request failed for {url}: {str(e)}")

    if not avatars:
        logger.error("No valid avatars generated. Using fallback avatars.")
        avatars = [f"https://api.dicebear.com/7.x/avataaars/svg?seed={i}" for i in range(count)]

    logger.info(f"Final Avatar List: {avatars}")
    return avatars
