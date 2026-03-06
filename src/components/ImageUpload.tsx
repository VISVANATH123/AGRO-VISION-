import React, { useState, useRef } from 'react';
import { Camera, Upload, X, Loader2, Radio, Focus } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/lib/utils';

interface ImageUploadProps {
  onImageSelect: (base64: string) => void;
  isAnalyzing: boolean;
}

export default function ImageUpload({ onImageSelect, isAnalyzing }: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isRealTimeMode, setIsRealTimeMode] = useState(false);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setPreview(base64);
        onImageSelect(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const startCamera = async (realTime = false) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraOpen(true);
        setIsRealTimeMode(realTime);
        if (realTime) {
          startRealTimeCapture();
        }
      }
    } catch (err) {
      console.error("Camera error:", err);
      alert("Could not access camera");
    }
  };

  const startRealTimeCapture = () => {
    const captureFrame = () => {
      if (videoRef.current && canvasRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
        const ctx = canvasRef.current.getContext('2d');
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        ctx?.drawImage(videoRef.current, 0, 0);
      }
      animationFrameRef.current = requestAnimationFrame(captureFrame);
    };
    animationFrameRef.current = requestAnimationFrame(captureFrame);
  };

  const capturePhoto = () => {
    if (isRealTimeMode && canvasRef.current) {
      const base64 = canvasRef.current.toDataURL('image/jpeg');
      setPreview(base64);
      onImageSelect(base64);
      stopCamera();
    } else if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(videoRef.current, 0, 0);
      const base64 = canvas.toDataURL('image/jpeg');
      setPreview(base64);
      onImageSelect(base64);
      stopCamera();
    }
  };

  const stopCamera = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    streamRef.current?.getTracks().forEach(track => track.stop());
    setIsCameraOpen(false);
    setIsRealTimeMode(false);
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <AnimatePresence mode="wait">
        {!preview && !isCameraOpen ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-stone-300 rounded-3xl hover:border-emerald-500 hover:bg-emerald-50/50 transition-all group"
            >
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Upload size={32} />
              </div>
              <span className="text-lg font-medium text-stone-700">Upload Image</span>
              <p className="text-sm text-stone-500 mt-2 text-center">Select a leaf photo</p>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />
            </button>

            <button
              onClick={() => startCamera(false)}
              className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-stone-300 rounded-3xl hover:border-emerald-500 hover:bg-emerald-50/50 transition-all group"
            >
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Camera size={32} />
              </div>
              <span className="text-lg font-medium text-stone-700">Capture Photo</span>
              <p className="text-sm text-stone-500 mt-2 text-center">Snap a single photo</p>
            </button>

            <button
              onClick={() => startCamera(true)}
              className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-emerald-400 rounded-3xl hover:border-emerald-600 hover:bg-emerald-100/30 transition-all group bg-emerald-50/30"
            >
              <div className="w-16 h-16 bg-emerald-600 text-white rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform animate-pulse">
                <Radio size={32} />
              </div>
              <span className="text-lg font-medium text-emerald-700 font-bold">Real-time Scan</span>
              <p className="text-sm text-emerald-600 mt-2 text-center font-medium">Live detection</p>
            </button>
          </motion.div>
        ) : isCameraOpen ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="relative rounded-3xl overflow-hidden bg-black"
          >
            {isRealTimeMode ? (
              <>
                <canvas
                  ref={canvasRef}
                  className="w-full h-full object-cover"
                  style={{ display: 'block', aspectRatio: '16/9' }}
                />
                <div className="absolute inset-0 border-4 border-emerald-500/50 pointer-events-none rounded-lg">
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-20 h-20 border-4 border-emerald-400 rounded-full animate-pulse"></div>
                </div>
              </>
            ) : (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
                style={{ aspectRatio: '16/9' }}
              />
            )}
            <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-4">
              <button
                onClick={stopCamera}
                className="p-4 bg-white/20 backdrop-blur-md text-white rounded-full hover:bg-white/30 transition-colors"
              >
                <X size={24} />
              </button>
              {isRealTimeMode && (
                <button
                  onClick={capturePhoto}
                  className="w-16 h-16 bg-emerald-500 rounded-full border-4 border-white flex items-center justify-center hover:scale-105 transition-transform hover:bg-emerald-600"
                  title="Capture frame for analysis"
                >
                  <Focus size={24} className="text-white" />
                </button>
              )}
              {!isRealTimeMode && (
                <button
                  onClick={capturePhoto}
                  className="w-16 h-16 bg-white rounded-full border-4 border-emerald-500 flex items-center justify-center hover:scale-105 transition-transform"
                />
              )}
            </div>
            {isRealTimeMode && (
              <div className="absolute top-6 left-6 flex items-center gap-2 bg-emerald-500/80 backdrop-blur-md text-white px-4 py-2 rounded-full animate-pulse">
                <Radio size={16} />
                <span className="text-sm font-medium">Live Scanning</span>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white"
          >
            <img src={preview!} alt="Preview" className="w-full aspect-square md:aspect-video object-cover" />
            
            {isAnalyzing && (
              <div className="absolute inset-0 bg-emerald-900/40 backdrop-blur-sm flex flex-col items-center justify-center text-white">
                <Loader2 className="animate-spin mb-4" size={48} />
                <p className="text-xl font-medium">Analyzing Crop Health...</p>
                <p className="text-emerald-100 mt-2">Identifying diseases and treatments</p>
              </div>
            )}

            {!isAnalyzing && (
              <button
                onClick={() => {
                  setPreview(null);
                  onImageSelect('');
                }}
                className="absolute top-4 right-4 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
              >
                <X size={20} />
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
