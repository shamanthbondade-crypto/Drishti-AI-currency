export class CameraError extends Error {
  public readonly type: CameraErrorType;

  constructor(message: string, type: CameraErrorType) {
    super(message);
    this.name = 'CameraError';
    this.type = type;
  }
}

export type CameraErrorType =
  | 'NOT_SUPPORTED'
  | 'PERMISSION_DENIED'
  | 'NOT_FOUND'
  | 'NOT_READABLE'
  | 'OVERCONSTRAINED'
  | 'UNKNOWN';

function mapMediaError(error: unknown): CameraError {
  if (error instanceof DOMException) {
    switch (error.name) {
      case 'NotAllowedError':
        return new CameraError(
          'Camera permission was denied. Please allow camera access in your browser settings.',
          'PERMISSION_DENIED',
        );
      case 'NotFoundError':
        return new CameraError(
          'No camera device was found on this device.',
          'NOT_FOUND',
        );
      case 'NotReadableError':
        return new CameraError(
          'The camera is already in use by another application.',
          'NOT_READABLE',
        );
      case 'OverconstrainedError':
        return new CameraError(
          'The requested camera constraints could not be satisfied.',
          'OVERCONSTRAINED',
        );
      default:
        return new CameraError(
          `Camera error: ${error.message}`,
          'UNKNOWN',
        );
    }
  }
  return new CameraError(
    error instanceof Error ? error.message : 'An unknown camera error occurred.',
    'UNKNOWN',
  );
}

/**
 * Checks whether the browser supports camera access via getUserMedia.
 */
export function checkCameraSupport(): boolean {
  return (
    typeof navigator !== 'undefined' &&
    typeof navigator.mediaDevices !== 'undefined' &&
    typeof navigator.mediaDevices.getUserMedia === 'function'
  );
}

/**
 * Requests access to the camera and returns a MediaStream.
 * Defaults to the rear (environment) camera if no facing mode is specified.
 */
export async function requestCamera(
  facingMode: 'user' | 'environment' = 'environment',
): Promise<MediaStream> {
  if (!checkCameraSupport()) {
    throw new CameraError(
      'Camera access is not supported in this browser.',
      'NOT_SUPPORTED',
    );
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: { ideal: facingMode },
        width: { ideal: 1280 },
        height: { ideal: 720 },
      },
      audio: false,
    });
    return stream;
  } catch (error) {
    throw mapMediaError(error);
  }
}

/**
 * Stops all tracks on the given MediaStream, releasing the camera.
 */
export function stopCamera(stream: MediaStream): void {
  for (const track of stream.getTracks()) {
    track.stop();
  }
}

/**
 * Captures a single frame from a <video> element and returns it as a Blob (JPEG).
 */
export async function captureFrame(
  videoElement: HTMLVideoElement,
): Promise<Blob> {
  const canvas = document.createElement('canvas');
  canvas.width = videoElement.videoWidth;
  canvas.height = videoElement.videoHeight;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new CameraError(
      'Failed to create canvas rendering context.',
      'UNKNOWN',
    );
  }

  ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(
            new CameraError(
              'Failed to capture frame from video element.',
              'UNKNOWN',
            ),
          );
        }
      },
      'image/jpeg',
      0.9,
    );
  });
}

/**
 * Queries the current camera permission state using the Permissions API.
 * Falls back to 'prompt' if the Permissions API is unavailable.
 */
export async function getCameraPermissionState(): Promise<PermissionState> {
  try {
    if (
      typeof navigator !== 'undefined' &&
      navigator.permissions &&
      typeof navigator.permissions.query === 'function'
    ) {
      const status = await navigator.permissions.query({
        name: 'camera' as PermissionName,
      });
      return status.state;
    }
  } catch {
    // Permissions API not available or query not supported for camera
  }
  return 'prompt';
}
