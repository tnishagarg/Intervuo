from fer.fer import FER
import numpy as np

detector = FER(mtcnn=False)
# Create a blank black image just to confirm the library loads and runs without crashing
dummy_frame = np.zeros((480, 640, 3), dtype=np.uint8)
result = detector.detect_emotions(dummy_frame)
print("FER loaded successfully. Result on blank frame:", result)