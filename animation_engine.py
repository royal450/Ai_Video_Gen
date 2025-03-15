import logging
import numpy as np
from typing import Dict, List, Tuple

logger = logging.getLogger(__name__)

class AnimationEngine:
    def __init__(self):
        self.gestures = {
            'idle': self._generate_idle_motion,
            'talk': self._generate_talk_motion,
            'nod': self._generate_nod_motion
        }

    def _generate_idle_motion(self, duration: float) -> List[Dict[str, float]]:
        """Generate subtle idle animation keyframes"""
        try:
            frames = []
            fps = 30
            total_frames = int(duration * fps)
            
            for frame in range(total_frames):
                t = frame / fps
                # Subtle breathing motion
                y_offset = np.sin(t * 2 * np.pi * 0.3) * 0.05
                
                frames.append({
                    'position': {'x': 0, 'y': y_offset, 'z': 0},
                    'rotation': {'x': 0, 'y': 0, 'z': 0},
                    'timestamp': t
                })
            
            return frames
        except Exception as e:
            logger.error(f"Error generating idle motion: {str(e)}")
            return []

    def _generate_talk_motion(self, duration: float, amplitude: float = 1.0) -> List[Dict[str, float]]:
        """Generate talking animation keyframes"""
        try:
            frames = []
            fps = 30
            total_frames = int(duration * fps)
            
            for frame in range(total_frames):
                t = frame / fps
                # Head movement during speech
                head_rot = np.sin(t * 2 * np.pi * 2) * 0.1 * amplitude
                
                frames.append({
                    'position': {'x': 0, 'y': 0, 'z': 0},
                    'rotation': {'x': head_rot, 'y': 0, 'z': 0},
                    'timestamp': t
                })
            
            return frames
        except Exception as e:
            logger.error(f"Error generating talk motion: {str(e)}")
            return []

    def _generate_nod_motion(self, duration: float) -> List[Dict[str, float]]:
        """Generate nodding animation keyframes"""
        try:
            frames = []
            fps = 30
            total_frames = int(duration * fps)
            
            for frame in range(total_frames):
                t = frame / fps
                # Nodding motion
                head_rot = np.sin(t * 2 * np.pi * 2) * 0.2
                
                frames.append({
                    'position': {'x': 0, 'y': 0, 'z': 0},
                    'rotation': {'x': head_rot, 'y': 0, 'z': 0},
                    'timestamp': t
                })
            
            return frames
        except Exception as e:
            logger.error(f"Error generating nod motion: {str(e)}")
            return []

    def generate_animation(self, duration: float, gesture_type: str = 'talk') -> List[Dict[str, float]]:
        """Generate animation frames for the specified gesture"""
        try:
            if gesture_type not in self.gestures:
                logger.warning(f"Unknown gesture type: {gesture_type}, falling back to idle")
                gesture_type = 'idle'
            
            return self.gestures[gesture_type](duration)
        except Exception as e:
            logger.error(f"Error generating animation: {str(e)}")
            return self._generate_idle_motion(duration)

    def blend_animations(self, animations: List[List[Dict[str, float]]], weights: List[float]) -> List[Dict[str, float]]:
        """Blend multiple animations together using weights"""
        try:
            if not animations or not weights or len(animations) != len(weights):
                raise ValueError("Invalid animations or weights")
                
            result = []
            base_frames = len(animations[0])
            
            for frame_idx in range(base_frames):
                blended_frame = {
                    'position': {'x': 0, 'y': 0, 'z': 0},
                    'rotation': {'x': 0, 'y': 0, 'z': 0},
                    'timestamp': animations[0][frame_idx]['timestamp']
                }
                
                for anim, weight in zip(animations, weights):
                    frame = anim[frame_idx]
                    for prop in ['position', 'rotation']:
                        for axis in ['x', 'y', 'z']:
                            blended_frame[prop][axis] += frame[prop][axis] * weight
                
                result.append(blended_frame)
            
            return result
        except Exception as e:
            logger.error(f"Error blending animations: {str(e)}")
            return animations[0] if animations else []