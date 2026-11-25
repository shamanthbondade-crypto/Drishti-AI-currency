import "dotenv/config";
import os from "node:os";
import express from "express";
import cors from "cors";
import multer from "multer";

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------
const PORT = Number(process.env.PORT) || 3001;
const HOST = process.env.HOST || "0.0.0.0";
const PYTHON_MODEL_SERVICE_URL =
  process.env.PYTHON_MODEL_SERVICE_URL || "http://localhost:8000";
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",").map((o) => o.trim())
  : ["http://localhost:5173", "http://localhost:3000", "http://localhost:8080"];

const PRIVATE_LAN_ORIGIN_RE =
  /^https?:\/\/(localhost|127\.0\.0\.1|10\.\d{1,3}\.\d{1,3}\.\d{1,3}|192\.168\.\d{1,3}\.\d{1,3}|172\.(1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3})(:\d+)?$/;

function getLanIpv4Addresses() {
  const addresses = [];
  const interfaces = os.networkInterfaces();
  for (const [name, entries] of Object.entries(interfaces)) {
    for (const entry of entries || []) {
      if (entry.family === "IPv4" && !entry.internal) {
        addresses.push({ name, address: entry.address });
      }
    }
  }
  return addresses;
}

// ---------------------------------------------------------------------------
// Express app
// ---------------------------------------------------------------------------
const app = express();

// CORS – allow configured origins and local/LAN/Capacitor mobile development
app.use(
  cors({
    origin(origin, cb) {
      if (
        !origin ||
        ALLOWED_ORIGINS.includes(origin) ||
        PRIVATE_LAN_ORIGIN_RE.test(origin) ||
        origin.startsWith("capacitor://") ||
        origin.startsWith("ionic://")
      ) {
        return cb(null, true);
      }
      return cb(new Error("Not allowed by CORS"));
    },
  })
);

// JSON body parser
app.use(express.json());

// ---------------------------------------------------------------------------
// Multer – multipart / image uploads (memory storage, 10 MB limit)
// ---------------------------------------------------------------------------
const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter(_req, file, cb) {
    if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new multer.MulterError(
          "LIMIT_UNEXPECTED_FILE",
          "Only jpeg, jpg, png, and webp images are allowed"
        )
      );
    }
  },
});

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------

// GET / – friendly root status response
app.get("/", (_req, res) => {
  res.json({
    status: "ok",
    service: "drishti-ai-backend",
    message: "Drishti AI Express API is running. Use /api/health, /api/model/status, or POST /api/predict.",
  });
});

// GET /api/health – simple liveness probe
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "drishti-ai-backend",
    timestamp: new Date().toISOString(),
  });
});

// GET /api/model/status – check if Python model service is reachable
app.get("/api/model/status", async (_req, res) => {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);

    let response;
    try {
      response = await fetch(`${PYTHON_MODEL_SERVICE_URL}/api/model/status`, {
        signal: controller.signal,
      });
    } catch {
      // Fallback to /health
      response = await fetch(`${PYTHON_MODEL_SERVICE_URL}/health`, {
        signal: controller.signal,
      });
    }
    clearTimeout(timeout);

    if (response && response.ok) {
      const data = await response.json();
      return res.json({
        available: true,
        modelName: data.modelName || data.model_name || "opencv-chroma-vision-v1",
        status: "ready",
        lastChecked: new Date().toISOString(),
        message: "AI model service is connected and ready",
      });
    }

    return res.json({
      available: false,
      modelName: "currency-vision-v1",
      status: "unavailable",
      lastChecked: new Date().toISOString(),
      message: "AI model service returned an unexpected status",
    });
  } catch {
    return res.json({
      available: false,
      modelName: "currency-vision-v1",
      status: "unavailable",
      lastChecked: new Date().toISOString(),
      message: "AI model service is not connected",
    });
  }
});

// POST /api/predict – forward image to the Python model service
app.post("/api/predict", upload.single("image"), async (req, res, next) => {
  try {
    // 1. Validate that an image was actually uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        status: "error",
        error: "No image file uploaded. Please attach an image in the 'image' field.",
      });
    }

    // 2. Build a multipart/form-data body to forward to the Python service
    const blob = new Blob([req.file.buffer], { type: req.file.mimetype });
    const formData = new FormData();
    formData.append("image", blob, req.file.originalname || "banknote.jpg");

    // 3. Forward to the Python model service
    let response;
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000); // 15 s

      response = await fetch(`${PYTHON_MODEL_SERVICE_URL}/api/predict`, {
        method: "POST",
        body: formData,
        signal: controller.signal,
      });
      clearTimeout(timeout);
    } catch {
      return res.status(503).json({
        success: false,
        status: "unavailable",
        error:
          "AI model service is not available. Please use Demo Mode.",
      });
    }

    // 4. Parse the response from the model service
    if (!response.ok) {
      const errorText = await response.text().catch(() => "Unknown error");
      return res.status(502).json({
        success: false,
        status: "error",
        error: "AI model service returned an error. Please try again later.",
      });
    }

    const prediction = await response.json();

    // 5. Handle recognition result and uncertain predictions
    const rawDenomination =
      prediction.denomination ?? prediction.label ?? "uncertain";
    const confidence = typeof prediction.confidence === "number" ? prediction.confidence : 0;
    const isUncertain = rawDenomination === "uncertain" || confidence < 0.5;

    return res.json({
      success: !isUncertain,
      status: isUncertain ? "uncertain" : "success",
      data: {
        denomination: isUncertain ? "uncertain" : rawDenomination,
        confidence,
        engine: prediction.engine || "ai-backend",
        status: isUncertain ? "uncertain" : "success",
        timestamp: new Date().toISOString(),
      },
    });
  } catch (err) {
    next(err);
  }
});

// ---------------------------------------------------------------------------
// Error-handling middleware
// ---------------------------------------------------------------------------

// Multer-specific errors
app.use((err, _req, res, next) => {
  if (err instanceof multer.MulterError) {
    const messages = {
      LIMIT_FILE_SIZE: "File is too large. Maximum size is 10 MB.",
      LIMIT_UNEXPECTED_FILE:
        err.message || "Only jpeg, jpg, png, and webp images are allowed.",
    };
    return res.status(400).json({
      success: false,
      status: "error",
      error: messages[err.code] || err.message,
    });
  }
  next(err);
});

// 404 handler – must be registered after all routes
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    status: "not_found",
    error: "The requested resource was not found.",
  });
});

// Global error handler – don't leak internal details
app.use((err, _req, res, _next) => {
  console.error("Unhandled error:", err);
  res.status(err.status || 500).json({
    success: false,
    status: "error",
    error: "An internal server error occurred. Please try again later.",
  });
});

// ---------------------------------------------------------------------------
// Start server
// ---------------------------------------------------------------------------
const server = app.listen(PORT, HOST, () => {
  console.log(`🚀  Drishti AI backend listening on http://${HOST}:${PORT}`);
  console.log(`🏠  Local health check: http://localhost:${PORT}/api/health`);
  const lanIps = getLanIpv4Addresses();
  if (lanIps.length > 0) {
    console.log("📱  LAN/Hotspot URLs for Android app:");
    for (const { name, address } of lanIps) {
      console.log(`    • [${name}] http://${address}:${PORT}`);
    }
  }
  console.log(`🤖  Python model service URL: ${PYTHON_MODEL_SERVICE_URL}`);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught exception (server kept alive):', err.message);
});
process.on('unhandledRejection', (reason) => {
  console.error('Unhandled rejection (server kept alive):', reason);
});
