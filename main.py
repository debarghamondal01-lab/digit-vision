# main.py
# Digit Vision — FastAPI backend for handwritten digit recognition

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import base64
import io

import numpy as np
from PIL import Image
import tensorflow as tf

# ---------- App Setup ----------
app = FastAPI(title="Digit Vision API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/static", StaticFiles(directory="static"), name="static")

# ---------- Load model ----------
print("Loading model... (this takes ~30 seconds)")
model = tf.keras.models.load_model('digit_cnn.h5')
print("Model loaded successfully!")

# ---------- Request model ----------
class ImageInput(BaseModel):
    image: str


# ---------- Preprocessing (MNIST-style) ----------
def preprocess_image(base64_string):
    """
    Convert base64 PNG → 28x28 MNIST-format tensor.
    Pipeline: decode → invert → crop to digit → resize to 20x20
              → pad to 28x28 → normalize.
    """
    # 1. Strip data URL prefix
    if ',' in base64_string:
        base64_string = base64_string.split(',')[1]

    # 2. Decode
    image_bytes = base64.b64decode(base64_string)
    image = Image.open(io.BytesIO(image_bytes)).convert('L')

    # 3. Invert so digit is white on black
    arr = np.array(image)
    arr = 255 - arr

    # 4. Find bounding box of the digit
    threshold = 40
    rows = np.any(arr > threshold, axis=1)
    cols = np.any(arr > threshold, axis=0)

    if not rows.any() or not cols.any():
        return np.zeros((1, 28, 28, 1), dtype=np.float32)

    y_min, y_max = np.where(rows)[0][[0, -1]]
    x_min, x_max = np.where(cols)[0][[0, -1]]

    # 5. Crop
    cropped = arr[y_min:y_max + 1, x_min:x_max + 1]
    h, w = cropped.shape

    # 6. Resize preserving aspect ratio to fit within 20x20
    if h > w:
        new_h = 20
        new_w = max(1, int(round(w * 20 / h)))
    else:
        new_w = 20
        new_h = max(1, int(round(h * 20 / w)))

    digit_img = Image.fromarray(cropped).resize((new_w, new_h), Image.LANCZOS)
    digit_arr = np.array(digit_img)

    # 7. Pad to 28x28 centered
    padded = np.zeros((28, 28), dtype=np.uint8)
    y_off = (28 - new_h) // 2
    x_off = (28 - new_w) // 2
    padded[y_off:y_off + new_h, x_off:x_off + new_w] = digit_arr

    # 8. Normalize and reshape
    normalized = padded.astype(np.float32) / 255.0
    normalized = normalized.reshape(1, 28, 28, 1)

    return normalized


# ---------- Routes ----------
@app.get("/")
def read_root():
    return FileResponse("static/index.html")


@app.post("/predict")
def predict(data: ImageInput):
    try:
        processed = preprocess_image(data.image)
        predictions = model.predict(processed, verbose=0)[0]

        top_indices = np.argsort(predictions)[::-1][:3]
        top_predictions = [
            {"digit": int(idx), "confidence": round(float(predictions[idx]) * 100, 2)}
            for idx in top_indices
        ]

        return {
            "predicted_digit": int(top_indices[0]),
            "confidence": round(float(predictions[top_indices[0]]) * 100, 2),
            "top_3": top_predictions
        }
    except Exception as e:
        return {"error": str(e)}
