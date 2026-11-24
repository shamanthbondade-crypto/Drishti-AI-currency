# Drishti AI - Python FastAPI Inference Service

This service bridges the Node.js Express backend with the TensorFlow/Keras CNN model for Indian Rupee banknote recognition.

## Supported Classes (6)
- ₹10
- ₹20
- ₹50
- ₹100
- ₹200
- ₹500

## Architecture
- **Framework**: FastAPI (Asynchronous Python REST API)
- **Image Preprocessing**: OpenCV (`cv2`) - Resized to 224x224, normalized to [0, 1] range, RGB color space
- **Deep Learning**: TensorFlow 2.x / Keras
- **Confidence Gating**: Returns `uncertain` if classification confidence < 0.60

## Quick Start

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

### 2. Place Trained Model
Place the trained model file from Google Colab at:
`models/currency_cnn_model.keras`

### 3. Run Service
```bash
uvicorn app:app --host 0.0.0.0 --port 8000 --reload
```

## API Endpoints
- `GET /health` - Checks server health, model loading status, and active classes.
- `POST /predict` - Accepts multipart file `image`, runs OpenCV preprocessing, and returns `{ denomination, confidence, is_uncertain, probabilities }`.

## Training the Model in Google Colab
See `colab_training_pipeline.py` for the complete transfer-learning training code using MobileNetV2 with data augmentation.
