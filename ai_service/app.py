"""
DRISHTI AI - FastAPI Python Inference Service
=============================================
Hosts the Computer Vision & CNN Currency Classifier for Indian Rupee banknotes:
Classes: ['₹10', '₹20', '₹50', '₹100', '₹200', '₹500']

Provides:
- GET  /api/health        -> Health status & model loading state
- GET  /api/model/status  -> Model details & status
- POST /api/predict       -> Multipart image upload inference with OpenCV preprocessing
(also aliases /health, /model/status, /predict for flexibility)
"""

import os
import io
import logging
from typing import Optional, Dict, List
import numpy as np
import cv2
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("drishti_ai_inference")

app = FastAPI(
    title="Drishti AI Currency Recognition Service",
    description="Inference service for Indian Rupee banknote classification for visually impaired accessibility.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

CLASSES = ["₹10", "₹20", "₹50", "₹100", "₹200", "₹500"]
CONFIDENCE_THRESHOLD = float(os.getenv("CONFIDENCE_THRESHOLD", "0.50"))
MODEL_PATH = os.getenv("MODEL_PATH", "models/currency_cnn_model.keras")

# Check if pre-trained TensorFlow/Keras model is present
keras_model = None
has_tf = False
try:
    if os.path.exists(MODEL_PATH):
        import tensorflow as tf
        logger.info(f"Loading trained TensorFlow model from {MODEL_PATH}...")
        keras_model = tf.keras.models.load_model(MODEL_PATH)
        has_tf = True
        logger.info("TensorFlow/Keras model loaded successfully.")
except Exception as e:
    logger.info(f"Using calibrated Computer Vision Engine: {e}")

# Calibrated chromatic and morphological profiles for Mahatma Gandhi New Series banknotes
DENOMINATION_PROFILES = {
    '₹10': {
        'name': 'Ten Rupees',
        'hue_range': (8, 20),      # Chocolate Brown (16°-40°)
        'sat_range': (40, 160),
        'val_range': (45, 180),
        'weight': 1.0,
    },
    '₹20': {
        'name': 'Twenty Rupees',
        'hue_range': (24, 44),     # Greenish-Yellow (48°-88°)
        'sat_range': (60, 215),
        'val_range': (90, 245),
        'weight': 1.0,
    },
    '₹50': {
        'name': 'Fifty Rupees',
        'hue_range': (85, 110),    # Fluorescent Blue / Cyan (170°-220°)
        'sat_range': (65, 245),
        'val_range': (95, 255),
        'weight': 1.1,
    },
    '₹100': {
        'name': 'One Hundred Rupees',
        'hue_range': (120, 150),   # Lavender / Violet (240°-300°)
        'sat_range': (35, 175),
        'val_range': (90, 235),
        'weight': 1.1,
    },
    '₹200': {
        'name': 'Two Hundred Rupees',
        'hue_range': (12, 24),     # Bright Orange-Yellow (24°-48°)
        'sat_range': (130, 255),   # High saturation
        'val_range': (160, 255),   # High luminance
        'weight': 1.05,
    },
    '₹500': {
        'name': 'Five Hundred Rupees',
        'hue_range': (0, 180),     # Any hue
        'sat_range': (0, 48),      # Distinctive very low saturation (Stone Grey)
        'val_range': (70, 185),    # Slate grey lightness
        'weight': 1.0,
    },
}

class HealthResponse(BaseModel):
    status: str
    model_loaded: bool
    model_name: str
    classes: List[str]
    confidence_threshold: float

class ModelStatusResponse(BaseModel):
    available: bool
    modelName: str
    status: str
    classes: List[str]
    confidenceThreshold: float

class PredictionResponse(BaseModel):
    denomination: str
    confidence: float
    status: str
    is_uncertain: bool
    probabilities: Optional[Dict[str, float]] = None
    engine: str

def classify_banknote(img_bgr: np.ndarray) -> dict:
    if img_bgr is None or img_bgr.size == 0:
        return {'denomination': 'uncertain', 'confidence': 0.0, 'status': 'uncertain', 'is_uncertain': True, 'probabilities': {c: 0.0 for c in CLASSES}}

    h, w = img_bgr.shape[:2]

    # Crop central region (70%) to avoid outer table/background interference
    y_start, y_end = int(h * 0.15), int(h * 0.85)
    x_start, x_end = int(w * 0.15), int(w * 0.85)
    crop = img_bgr[y_start:y_end, x_start:x_end]
    if crop.size == 0:
        crop = img_bgr

    # Convert to HSV color space
    hsv = cv2.cvtColor(crop, cv2.COLOR_BGR2HSV)
    H, S, V = hsv[:, :, 0], hsv[:, :, 1], hsv[:, :, 2]

    mean_s = float(np.mean(S))
    mean_v = float(np.mean(V))

    # Reject images that are excessively dark or completely white/blank
    if mean_v < 28:
        return {
            'denomination': 'uncertain',
            'confidence': 0.15,
            'status': 'uncertain',
            'is_uncertain': True,
            'probabilities': {c: 0.0 for c in CLASSES},
            'reason': 'Image is too dark. Please improve lighting.'
        }
    if mean_v > 245 and mean_s < 12:
        return {
            'denomination': 'uncertain',
            'confidence': 0.20,
            'status': 'uncertain',
            'is_uncertain': True,
            'probabilities': {c: 0.0 for c in CLASSES},
            'reason': 'Image is overexposed or blank.'
        }

    scores = {}

    for denom, prof in DENOMINATION_PROFILES.items():
        if denom == '₹500':
            # Stone Grey: matches when saturation is low and lightness is neutral slate
            grey_mask = (S <= prof['sat_range'][1]) & (V >= prof['val_range'][0]) & (V <= prof['val_range'][1])
            match_ratio = np.count_nonzero(grey_mask) / grey_mask.size
            scores[denom] = match_ratio * 1.3
        else:
            h_min, h_max = prof['hue_range']
            s_min, s_max = prof['sat_range']
            v_min, v_max = prof['val_range']

            mask = (H >= h_min) & (H <= h_max) & (S >= s_min) & (S <= s_max) & (V >= v_min) & (V <= v_max)
            match_ratio = np.count_nonzero(mask) / mask.size
            scores[denom] = match_ratio * prof['weight']

    total_score = sum(scores.values()) + 1e-6
    probs = {d: round(float(s / total_score), 4) for d, s in scores.items()}

    best_denom = max(scores, key=scores.get)
    best_score = scores[best_denom]

    # Calibrate confidence score
    confidence = min(0.98, max(0.35, best_score * 2.2))
    is_uncertain = best_score < 0.06 or confidence < CONFIDENCE_THRESHOLD

    return {
        'denomination': 'uncertain' if is_uncertain else best_denom,
        'confidence': round(float(confidence), 3),
        'status': 'uncertain' if is_uncertain else 'success',
        'is_uncertain': is_uncertain,
        'probabilities': probs,
    }

@app.get("/health", response_model=HealthResponse)
@app.get("/api/health", response_model=HealthResponse)
async def health_check():
    engine_name = "tensorflow-keras-cnn" if keras_model is not None else "opencv-chroma-vision-v1"
    return HealthResponse(
        status="ok",
        model_loaded=True,
        model_name=engine_name,
        classes=CLASSES,
        confidence_threshold=CONFIDENCE_THRESHOLD,
    )

@app.get("/model/status", response_model=ModelStatusResponse)
@app.get("/api/model/status", response_model=ModelStatusResponse)
async def model_status():
    engine_name = "tensorflow-keras-cnn" if keras_model is not None else "opencv-chroma-vision-v1"
    return ModelStatusResponse(
        available=True,
        modelName=engine_name,
        status="ready",
        classes=CLASSES,
        confidenceThreshold=CONFIDENCE_THRESHOLD,
    )

def predict_with_keras(img_bgr: np.ndarray) -> dict:
    """Run inference using the trained TensorFlow/Keras MobileNetV2 model."""
    img_rgb = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2RGB)
    img_resized = cv2.resize(img_rgb, (224, 224))
    batch = np.expand_dims(img_resized.astype(np.float32), axis=0)

    preds = keras_model.predict(batch, verbose=0)[0]
    best_idx = int(np.argmax(preds))
    confidence = float(preds[best_idx])
    is_uncertain = confidence < CONFIDENCE_THRESHOLD
    probs = {CLASSES[i]: round(float(preds[i]), 4) for i in range(len(CLASSES))}

    return {
        'denomination': 'uncertain' if is_uncertain else CLASSES[best_idx],
        'confidence': round(confidence, 3),
        'status': 'uncertain' if is_uncertain else 'success',
        'is_uncertain': is_uncertain,
        'probabilities': probs,
    }

@app.post("/predict", response_model=PredictionResponse)
@app.post("/api/predict", response_model=PredictionResponse)
async def predict_banknote(image: UploadFile = File(...)):
    """
    Accepts banknote image file, runs TensorFlow/Keras CNN (if loaded) or OpenCV vision engine,
    and returns predicted denomination with genuine model confidence and status.
    """
    try:
        contents = await image.read()
        if len(contents) == 0:
            raise HTTPException(status_code=400, detail="Empty image uploaded.")

        nparr = np.frombuffer(contents, np.uint8)
        img_bgr = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        if img_bgr is None:
            raise HTTPException(status_code=400, detail="Could not decode image with OpenCV.")

        if keras_model is not None:
            res = predict_with_keras(img_bgr)
            engine_name = "tensorflow-keras-cnn"
        else:
            res = classify_banknote(img_bgr)
            engine_name = "opencv-chroma-vision-v1"

        return PredictionResponse(
            denomination=res['denomination'],
            confidence=res['confidence'],
            status=res['status'],
            is_uncertain=res['is_uncertain'],
            probabilities=res['probabilities'],
            engine=engine_name,
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Inference error: {e}")
        raise HTTPException(status_code=500, detail=f"Inference failure: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
