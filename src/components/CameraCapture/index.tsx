import { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CameraCaptureProps {
  onCapture: (imageData: string) => void;
  onClose: () => void;
}

const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapture, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);

  useEffect(() => {
    let stream: MediaStream | null = null;

    const initCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' }
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            setIsCameraReady(true);
          };
        }
      } catch (err) {
        console.error("Error accessing camera:", err);
        setCameraError("Unable to access camera. Please check permissions.");
      }
    };

    initCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current && isCameraReady) {
      setIsCapturing(true);
      
      // Animate capture flash
      setTimeout(() => {
        setIsCapturing(false);
        
        const video = videoRef.current;
        const canvas = canvasRef.current;

        // Set canvas dimensions to match video
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        // Draw current video frame to canvas
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(video, 0, 0);

          // Convert canvas to image data URL
          const imageDataUrl = canvas.toDataURL('image/jpeg');
          setCapturedImage(imageDataUrl);
        }
      }, 150);
    }
  };

  const handleConfirmCapture = () => {
    if (capturedImage) {
      onCapture(capturedImage);
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 bg-black flex flex-col"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        className="absolute top-0 left-0 right-0 z-10 flex justify-between items-center p-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <motion.button
          className="text-white p-2 rounded-full bg-black/30 backdrop-blur-sm"
          whileHover={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
          whileTap={{ scale: 0.95 }}
          onClick={onClose}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </motion.button>
        
        {capturedImage && (
          <motion.button
            className="text-white px-4 py-2 rounded-full bg-app-blue"
            whileHover={{ scale: 1.05, backgroundColor: '#0062CC' }}
            whileTap={{ scale: 0.95 }}
            onClick={handleConfirmCapture}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            Use Photo
          </motion.button>
        )}
      </motion.div>
      
      <div className="flex-1 relative">
        {!capturedImage ? (
          <>
            {cameraError ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-red-500/80 text-white p-4 rounded-lg max-w-xs text-center">
                  {cameraError}
                </div>
              </div>
            ) : (
              <>
                <video
                  ref={videoRef}
                  className="absolute inset-0 w-full h-full object-cover"
                  autoPlay
                  playsInline
                />
                
                {/* Camera grid overlay */}
                <div className="absolute inset-0 pointer-events-none">
                  <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <line x1="33.33" y1="0" x2="33.33" y2="100" stroke="rgba(255,255,255,0.2)" strokeWidth="0.1" />
                    <line x1="66.66" y1="0" x2="66.66" y2="100" stroke="rgba(255,255,255,0.2)" strokeWidth="0.1" />
                    <line x1="0" y1="33.33" x2="100" y2="33.33" stroke="rgba(255,255,255,0.2)" strokeWidth="0.1" />
                    <line x1="0" y1="66.66" x2="100" y2="66.66" stroke="rgba(255,255,255,0.2)" strokeWidth="0.1" />
                  </svg>
                </div>
                
                {/* Capture flash effect */}
                <AnimatePresence>
                  {isCapturing && (
                    <motion.div 
                      className="absolute inset-0 bg-white"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.15 }}
                    />
                  )}
                </AnimatePresence>
              </>
            )}
          </>
        ) : (
          <div className="absolute inset-0">
            <img 
              src={capturedImage} 
              alt="Captured" 
              className="w-full h-full object-cover"
            />
          </div>
        )}
        
        <canvas ref={canvasRef} className="hidden" />
      </div>
      
      <motion.div
        className="p-6 flex justify-center items-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {!capturedImage ? (
          <motion.button
            className="w-16 h-16 rounded-full bg-white border-4 border-gray-400 shadow-lg"
            whileHover={{ scale: 1.05, borderColor: 'white' }}
            whileTap={{ scale: 0.95 }}
            onClick={handleCapture}
            disabled={!isCameraReady || !!cameraError}
            animate={isCameraReady && !cameraError ? {} : { opacity: 0.5 }}
          />
        ) : (
          <motion.button
            className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center"
            whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.3)' }}
            whileTap={{ scale: 0.95 }}
            onClick={handleRetake}
          >
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </motion.button>
        )}
      </motion.div>
    </motion.div>
  );
};

export default CameraCapture;
