# Drishti AI — Backend Server

Node.js / Express backend that sits between the Drishti AI frontend and the Python
currency-recognition model service.

---

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Copy the example env (or create your own .env)
#    The repo already ships a .env — review and adjust as needed.

# 3. Start in development mode (auto-restart on save, Node ≥ 18.11)
npm run dev

# 4. Or start in production mode
npm start
```

The server starts on **http://localhost:3001** by default.

---

## Environment Variables

| Variable                   | Default                   | Description                                             |
| -------------------------- | ------------------------- | ------------------------------------------------------- |
| `PORT`                     | `3001`                    | Port the Express server listens on.                     |
| `PYTHON_MODEL_SERVICE_URL` | `http://localhost:8000`   | Base URL of the Python model (FastAPI / Flask) service.  |
| `ALLOWED_ORIGINS`          | `http://localhost:5173`   | Comma-separated list of origins allowed by CORS.        |

All variables are read from a `.env` file in the project root (powered by **dotenv**).

---

## Connecting the Python Model Service

The backend expects a Python service (e.g. FastAPI) running at `PYTHON_MODEL_SERVICE_URL`
that exposes two endpoints:

| Endpoint    | Method | Description                                                                 |
| ----------- | ------ | --------------------------------------------------------------------------- |
| `/health`   | GET    | Returns `200 OK` when the model is loaded and ready.                        |
| `/predict`  | POST   | Accepts a multipart form with an `image` field and returns a JSON prediction. |

**Expected prediction response from the Python service:**

```json
{
  "denomination": "500",
  "confidence": 0.97
}
```

If `confidence < 0.5`, the backend automatically sets `denomination` to `"uncertain"`.

---

## API Documentation

### `GET /api/health`

Backend liveness check.

**Response `200`**

```json
{
  "status": "ok",
  "service": "drishti-ai-backend",
  "timestamp": "2026-11-24T12:00:00.000Z"
}
```

**Example**

```bash
curl http://localhost:3001/api/health
```

---

### `GET /api/model/status`

Check whether the Python model service is reachable.

**Response `200`**

```json
{
  "available": true,
  "modelName": "currency-cnn-v1",
  "lastChecked": "2026-11-24T12:00:00.000Z",
  "message": "AI model service is connected and ready"
}
```

When the model service is **not** reachable:

```json
{
  "available": false,
  "modelName": "currency-cnn-v1",
  "lastChecked": "2026-11-24T12:00:00.000Z",
  "message": "AI model service is not connected"
}
```

**Example**

```bash
curl http://localhost:3001/api/model/status
```

---

### `POST /api/predict`

Upload an image for currency recognition.

| Field   | Type   | Required | Description                        |
| ------- | ------ | -------- | ---------------------------------- |
| `image` | File   | Yes      | JPEG, JPG, PNG, or WebP (≤ 10 MB) |

**Success Response `200`**

```json
{
  "success": true,
  "data": {
    "denomination": "500",
    "confidence": 0.97,
    "timestamp": "2026-11-24T12:00:00.000Z"
  }
}
```

**Model Service Unavailable `503`**

```json
{
  "success": false,
  "error": "AI model service is not available. Please use Demo Mode."
}
```

**No Image Uploaded `400`**

```json
{
  "success": false,
  "error": "No image file uploaded. Please attach an image in the 'image' field."
}
```

**Examples**

```bash
# Predict with a local image
curl -X POST http://localhost:3001/api/predict \
  -F "image=@./sample_note.jpg"

# Predict with a PNG
curl -X POST http://localhost:3001/api/predict \
  -F "image=@./500_rupee.png"
```

---

## Error Handling

| Status | Scenario                                       |
| ------ | ---------------------------------------------- |
| `400`  | Missing image, wrong file type, file too large  |
| `404`  | Unknown route                                  |
| `502`  | Python model service returned an error          |
| `503`  | Python model service is unreachable             |
| `500`  | Unexpected internal server error                |

Internal error details are **never** exposed to the client.

---

## Project Structure

```
server/
├── .env            # Environment variables
├── index.js        # Express application entry point
├── package.json    # Project metadata & dependencies
└── README.md       # This file
```
