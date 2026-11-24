import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Upload as UploadIcon,
  Image as ImageIcon,
  Check,
  RefreshCw,
  X,
  AlertCircle,
  ArrowLeft,
} from 'lucide-react';
import Layout from '../components/Layout';
import Button from '../components/Button';
import Card from '../components/Card';
import { useApp } from '../contexts/AppContext';
import { useVoice } from '../contexts/VoiceContext';

const MAX_FILE_SIZE_MB = 10;
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

export default function Upload() {
  const navigate = useNavigate();
  const { setCapturedImage } = useApp();
  const { speak, announceError, triggerHaptic } = useVoice();

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const validateAndProcessFile = (file: File) => {
    setErrorMessage(null);

    // Validate type
    if (!ALLOWED_TYPES.includes(file.type)) {
      const msg = 'Invalid file type. Please upload a JPG, JPEG, PNG, or WEBP image.';
      setErrorMessage(msg);
      speak(msg);
      return;
    }

    // Validate size (10 MB)
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      const msg = `File is too large. Maximum size is ${MAX_FILE_SIZE_MB}MB.`;
      setErrorMessage(msg);
      speak(msg);
      return;
    }

    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    speak('Banknote image selected. Ready for identification.');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndProcessFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndProcessFile(e.dataTransfer.files[0]);
    }
  };

  const handleClear = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setSelectedFile(null);
    setPreviewUrl(null);
    setErrorMessage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    speak('Image removed.');
  };

  const handleConfirm = () => {
    if (!selectedFile) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setCapturedImage(base64);
      speak('Analyzing uploaded banknote image.');
      navigate('/recognition');
    };
    reader.readAsDataURL(selectedFile);
  };

  return (
    <Layout title="Upload Banknote Image" showBack>
      <div className="space-y-6">
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={handleFileChange}
          aria-label="Upload currency banknote image"
        />

        {/* Error notification */}
        {errorMessage && (
          <div
            role="alert"
            className="flex items-center gap-3 p-4 rounded-2xl bg-red-500/15 border border-red-500/30 text-red-200 text-sm"
          >
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Upload Dropzone / Preview */}
        {previewUrl ? (
          <div className="space-y-4">
            <div className="relative overflow-hidden rounded-3xl bg-black border-2 border-cyan-400/40 p-2 shadow-2xl">
              <img
                src={previewUrl}
                alt="Selected banknote preview"
                className="w-full h-64 object-contain rounded-2xl bg-black/80"
              />
              <button
                onClick={handleClear}
                className="absolute top-4 right-4 p-2.5 rounded-full bg-black/70 hover:bg-black text-white border border-white/20 transition-all min-w-[40px] min-h-[40px] flex items-center justify-center"
                aria-label="Remove image"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center justify-between px-2 text-xs text-gray-300">
              <span className="truncate max-w-[200px] font-semibold">{selectedFile?.name}</span>
              <span>{(selectedFile ? selectedFile.size / (1024 * 1024) : 0).toFixed(2)} MB</span>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <Button
                variant="secondary"
                size="lg"
                fullWidth
                onClick={() => fileInputRef.current?.click()}
                iconLeft={<RefreshCw className="w-5 h-5" />}
                aria-label="Select different image"
              >
                Replace
              </Button>
              <Button
                variant="primary"
                size="lg"
                fullWidth
                onClick={handleConfirm}
                iconLeft={<Check className="w-6 h-6 text-gray-950" />}
                className="font-extrabold text-gray-950 bg-gradient-to-r from-cyan-400 to-teal-400"
                aria-label="Identify this note"
              >
                Identify Note
              </Button>
            </div>
          </div>
        ) : (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`
              flex flex-col items-center justify-center p-8 sm:p-12
              rounded-3xl border-2 border-dashed transition-all cursor-pointer
              min-h-[280px] text-center
              ${
                isDragging
                  ? 'border-cyan-400 bg-cyan-500/10 scale-[1.01]'
                  : 'border-cyan-500/30 bg-[#0f2347]/60 hover:bg-[#132c58]/80 hover:border-cyan-400/60'
              }
            `}
            role="button"
            tabIndex={0}
            aria-label="Tap or drop banknote image here"
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                fileInputRef.current?.click();
              }
            }}
          >
            <div className="w-20 h-20 rounded-2xl bg-cyan-500/10 border border-cyan-400/20 flex items-center justify-center text-cyan-400 mb-4 shadow-lg shadow-cyan-500/10">
              <UploadIcon className="w-10 h-10" />
            </div>

            <h2 className="text-lg font-bold text-white mb-1">
              Select or Drop Banknote Image
            </h2>
            <p className="text-sm text-gray-300 max-w-xs mb-4 leading-relaxed">
              Accepts clear photos of ₹10, ₹20, ₹50, ₹100, ₹200, or ₹500 notes.
            </p>

            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/5 text-cyan-300 border border-white/10">
              JPG • PNG • WEBP • Max 10MB
            </span>
          </div>
        )}

        {/* Accessibility Guidance */}
        <Card padding="md" className="space-y-2">
          <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
            <ImageIcon className="w-4 h-4" />
            <span>Photography Tips for Best Results</span>
          </div>
          <ul className="text-xs text-gray-300 space-y-1.5 list-disc list-inside">
            <li>Place the note on a contrasting, plain background.</li>
            <li>Ensure adequate room lighting without heavy shadows.</li>
            <li>Capture the full banknote horizontally inside the frame.</li>
          </ul>
        </Card>
      </div>
    </Layout>
  );
}
