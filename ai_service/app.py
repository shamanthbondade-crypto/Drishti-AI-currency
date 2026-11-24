"""
DRISHTI AI - FastAPI Python Inference Service
=============================================
Hosts the OCR Number Reader, TensorFlow/Keras CNN, and OpenCV Vision Engine
for Indian Rupee banknote recognition:
Classes: ['₹10', '₹20', '₹50', '₹100', '₹200', '₹500']

Provides:
- GET  /api/health        -> Health status & model loading state
- GET  /api/model/status  -> Model details & status
- POST /api/predict       -> Multipart image upload inference
(also aliases /health, /model/status, /predict for flexibility)
"""

import os
import re
import logging
from typing import Optional, Dict, List, Tuple
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
    version="1.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CLASSES = ["₹10", "₹20", "₹50", "₹100", "₹200", "₹500"]
# image_dataset_from_directory in colab_training_pipeline.py sorts folders alphabetically:
# ['10', '100', '20', '200', '50', '500']
KERAS_CLASSES = ["₹10", "₹100", "₹20", "₹200", "₹50", "₹500"]
CONFIDENCE_THRESHOLD = float(os.getenv("CONFIDENCE_THRESHOLD", "0.50"))
MODEL_PATH = os.getenv("MODEL_PATH", os.path.join(BASE_DIR, "models", "currency_cnn_model.keras"))

# 1. Load TensorFlow/Keras model if present
keras_model = None
try:
    if os.path.exists(MODEL_PATH):
        import tensorflow as tf
        logger.info(f"Loading trained TensorFlow model from {MODEL_PATH}...")
        keras_model = tf.keras.models.load_model(MODEL_PATH)
        logger.info("TensorFlow/Keras model loaded successfully.")
except Exception as e:
    logger.info(f"TensorFlow/Keras model unavailable: {e}")

# 2. Load RapidOCR for reading printed denomination numbers on banknotes
ocr_engine = None
try:
    from rapidocr_onnxruntime import RapidOCR
    ocr_engine = RapidOCR()
    logger.info("RapidOCR number-reading engine loaded successfully.")
except Exception as e:
    logger.info(f"RapidOCR unavailable: {e}")

VALID_NUMBERS = {"10", "20", "50", "100", "200", "500"}
WORD_TO_DENOM: List[Tuple[str, str]] = [
    ("FIVE HUNDRED", "₹500"),
    ("TWO HUNDRED", "₹200"),
    ("ONE HUNDRED", "₹100"),
    ("FIFTY", "₹50"),
    ("TWENTY", "₹20"),
    ("TEN", "₹10"),
]

# Calibrated chromatic and morphological profiles for Mahatma Gandhi New Series banknotes
DENOMINATION_PROFILES = {
    '₹10': {'hue_range': (8, 20), 'sat_range': (40, 160), 'val_range': (45, 180), 'weight': 1.0},
    '₹20': {'hue_range': (24, 44), 'sat_range': (60, 215), 'val_range': (90, 245), 'weight': 1.0},
    '₹50': {'hue_range': (85, 110), 'sat_range': (65, 245), 'val_range': (95, 255), 'weight': 1.1},
    '₹100': {'hue_range': (120, 150), 'sat_range': (35, 175), 'val_range': (90, 235), 'weight': 1.1},
    '₹200': {'hue_range': (12, 24), 'sat_range': (130, 255), 'val_range': (160, 255), 'weight': 1.05},
    '₹500': {'hue_range': (0, 180), 'sat_range': (0, 48), 'val_range': (70, 185), 'weight': 1.0},
}


class HealthResponse(BaseModel):
    status: str
    model_loaded: bool
    ocr_loaded: bool
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


def _box_area(box: List[List[float]]) -> float:
    """Compute bounding-box area from 4-point OCR polygon."""
    try:
        xs = [p[0] for p in box]
        ys = [p[1] for p in box]
        return max(1.0, (max(xs) - min(xs)) * (max(ys) - min(ys)))
    except Exception:
        return 1.0


def _scan_ocr_frame(img_bgr: np.ndarray) -> Optional[Tuple[str, float]]:
    """Run RapidOCR on a single image orientation and score denomination matches."""
    if ocr_engine is None:
        return None

    result, _ = ocr_engine(img_bgr)
    if not result:
        return None

    h, w = img_bgr.shape[:2]
    img_area = float(max(1, h * w))
    denom_scores: Dict[str, float] = {c: 0.0 for c in CLASSES}
    denom_best_conf: Dict[str, float] = {c: 0.0 for c in CLASSES}

    for item in result:
        box, text, conf = item[0], str(item[1]).upper().strip(), float(item[2])
        if conf < 0.45:
            continue

        area_ratio = _box_area(box) / img_area

        # Check English denomination words (e.g., "FIVE HUNDRED RUPEES")
        for phrase, denom in WORD_TO_DENOM:
            if phrase in text:
                denom_scores[denom] += conf * 1.5
                denom_best_conf[denom] = max(denom_best_conf[denom], conf)

        # Clean common OCR symbol artifacts around numbers (₹, Rs, commas, spaces)
        cleaned = text.replace("₹", " ").replace("RS.", " ").replace("RS", " ").replace(",", "")
        tokens = re.findall(r"\b\d+\b", cleaned)
        for tok in tokens:
            if tok in VALID_NUMBERS:
                denom = f"₹{tok}"
                # Larger printed numerals on banknotes get higher weight than tiny serial/print digits
                size_boost = 1.0 + min(3.0, area_ratio * 80.0)
                denom_scores[denom] += conf * size_boost
                denom_best_conf[denom] = max(denom_best_conf[denom], conf)

    best_denom = max(denom_scores, key=denom_scores.get)
    if denom_scores[best_denom] <= 0.0:
        return None

    return best_denom, round(min(0.99, max(0.55, denom_best_conf[best_denom])), 3)


def read_denomination_ocr(img_bgr: np.ndarray) -> Optional[Tuple[str, float]]:
    """Read printed denomination numbers/words, trying 90-degree rotation if needed."""
    match = _scan_ocr_frame(img_bgr)
    if match is not None:
        return match

    # Try 90-degree rotated frame for vertical/sideways handheld notes
    rotated = cv2.rotate(img_bgr, cv2.ROTATE_90_CLOCKWISE)
    return _scan_ocr_frame(rotated)


def classify_banknote(img_bgr: np.ndarray) -> dict:
    if img_bgr is None or img_bgr.size == 0:
        return {'denomination': 'uncertain', 'confidence': 0.0, 'status': 'uncertain', 'is_uncertain': True, 'probabilities': {c: 0.0 for c in CLASSES}}

    h, w = img_bgr.shape[:2]
    y_start, y_end = int(h * 0.15), int(h * 0.85)
    x_start, x_end = int(w * 0.15), int(w * 0.85)
    crop = img_bgr[y_start:y_end, x_start:x_end]
    if crop.size == 0:
        crop = img_bgr

    hsv = cv2.cvtColor(crop, cv2.COLOR_BGR2HSV)
    H, S, V = hsv[:, :, 0], hsv[:, :, 1], hsv[:, :, 2]
    mean_s, mean_v = float(np.mean(S)), float(np.mean(V))

    if mean_v < 28 or (mean_v > 245 and mean_s < 12):
        return {
            'denomination': 'uncertain',
            'confidence': 0.15,
            'status': 'uncertain',
            'is_uncertain': True,
            'probabilities': {c: 0.0 for c in CLASSES},
        }

    scores = {}
    for denom, prof in DENOMINATION_PROFILES.items():
        if denom == '₹500':
            grey_mask = (S <= prof['sat_range'][1]) & (V >= prof['val_range'][0]) & (V <= prof['val_range'][1])
            scores[denom] = (np.count_nonzero(grey_mask) / grey_mask.size) * 1.3
        else:
            h_min, h_max = prof['hue_range']
            s_min, s_max = prof['sat_range']
            v_min, v_max = prof['val_range']
            mask = (H >= h_min) & (H <= h_max) & (S >= s_min) & (S <= s_max) & (V >= v_min) & (V <= v_max)
            scores[denom] = (np.count_nonzero(mask) / mask.size) * prof['weight']

    total_score = sum(scores.values()) + 1e-6
    probs = {d: round(float(s / total_score), 4) for d, s in scores.items()}
    best_denom = max(scores, key=scores.get)
    best_score = scores[best_denom]

    confidence = min(0.98, max(0.35, best_score * 2.2))
    is_uncertain = best_score < 0.06 or confidence < CONFIDENCE_THRESHOLD

    return {
        'denomination': 'uncertain' if is_uncertain else best_denom,
        'confidence': round(float(confidence), 3),
        'status': 'uncertain' if is_uncertain else 'success',
        'is_uncertain': is_uncertain,
        'probabilities': probs,
    }


def predict_with_keras(img_bgr: np.ndarray) -> dict:
    """Run inference using the trained TensorFlow/Keras MobileNetV2 model."""
    img_rgb = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2RGB)
    img_resized = cv2.resize(img_rgb, (224, 224))
    batch = np.expand_dims(img_resized.astype(np.float32), axis=0)

    preds = keras_model.predict(batch, verbose=0)[0]
    best_idx = int(np.argmax(preds))
    confidence = float(preds[best_idx])
    is_uncertain = confidence < CONFIDENCE_THRESHOLD
    probs = {KERAS_CLASSES[i]: round(float(preds[i]), 4) for i in range(len(KERAS_CLASSES))}

    return {
        'denomination': 'uncertain' if is_uncertain else KERAS_CLASSES[best_idx],
        'confidence': round(confidence, 3),
        'status': 'uncertain' if is_uncertain else 'success',
        'is_uncertain': is_uncertain,
        'probabilities': probs,
    }


def _active_engine_label() -> str:
    if ocr_engine is not None and keras_model is not None:
        return "ocr+tensorflow-keras-cnn"
    if ocr_engine is not None:
        return "rapidocr-number-reader"
    if keras_model is not None:
        return "tensorflow-keras-cnn"
    return "opencv-chroma-vision-v1"


@app.get("/")
async def root():
    return {
        "status": "ok",
        "service": "drishti-ai-inference",
        "engine": _active_engine_label(),
        "endpoints": ["/api/health", "/api/model/status", "/api/predict", "/docs"],
    }


@app.get("/health", response_model=HealthResponse)
@app.get("/api/health", response_model=HealthResponse)
async def health_check():
    return HealthResponse(
        status="ok",
        model_loaded=keras_model is not None or ocr_engine is not None,
        ocr_loaded=ocr_engine is not None,
        model_name=_active_engine_label(),
        classes=CLASSES,
        confidence_threshold=CONFIDENCE_THRESHOLD,
    )


@app.get("/model/status", response_model=ModelStatusResponse)
@app.get("/api/model/status", response_model=ModelStatusResponse)
async def model_status():
    return ModelStatusResponse(
        available=True,
        modelName=_active_engine_label(),
        status="ready",
        classes=CLASSES,
        confidenceThreshold=CONFIDENCE_THRESHOLD,
    )


@app.post("/predict", response_model=PredictionResponse)
@app.post("/api/predict", response_model=PredictionResponse)
async def predict_banknote(image: UploadFile = File(...)):
    """
    Accepts banknote image file:
    1. Attempts OCR number reading (RapidOCR) to read printed numerals/words directly.
    2. Runs TensorFlow/Keras CNN (with corrected alphabetical class mapping) if loaded,
       or OpenCV chromatic fallback otherwise.
    """
    try:
        contents = await image.read()
        if len(contents) == 0:
            raise HTTPException(status_code=400, detail="Empty image uploaded.")

        nparr = np.frombuffer(contents, np.uint8)
        img_bgr = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        if img_bgr is None:
            raise HTTPException(status_code=400, detail="Could not decode image with OpenCV.")

        # Step 1: Read printed denomination number/words via OCR
        ocr_match = read_denomination_ocr(img_bgr)

        # Step 2: Run Keras CNN (or HSV fallback)
        if keras_model is not None:
            cv_res = predict_with_keras(img_bgr)
            cv_engine = "tensorflow-keras-cnn"
        else:
            cv_res = classify_banknote(img_bgr)
            cv_engine = "opencv-chroma-vision-v1"

        # Step 3: Prefer clear OCR numeral match when available
        if ocr_match is not None:
            ocr_denom, ocr_conf = ocr_match
            probs = cv_res.get('probabilities') or {c: 0.0 for c in CLASSES}
            return PredictionResponse(
                denomination=ocr_denom,
                confidence=ocr_conf,
                status="success",
                is_uncertain=False,
                probabilities=probs,
                engine="rapidocr+cnn" if keras_model is not None else "rapidocr-number-reader",
            )

        return PredictionResponse(
            denomination=cv_res['denomination'],
            confidence=cv_res['confidence'],
            status=cv_res['status'],
            is_uncertain=cv_res['is_uncertain'],
            probabilities=cv_res['probabilities'],
            engine=cv_engine,
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Inference error: {e}")
        raise HTTPException(status_code=500, detail=f"Inference failure: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
