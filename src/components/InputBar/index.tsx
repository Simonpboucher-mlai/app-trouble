import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AudioMotionAnalyzer from 'audiomotion-analyzer';
import CameraCapture from '../CameraCapture';
import SiriWaveform from '../AudioVisualizer/SiriWaveform';
import DynamicAudioVisualizer from '../AudioVisualizer/DynamicAudioVisualizer';

interface InputBarProps {
  onSendMessage: (message: string) => void;
}

const InputBar: React.FC<InputBarProps> = ({ onSendMessage }) => {
  const [message, setMessage] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [showAudioVisualizer, setShowAudioVisualizer] = useState(false);

  const audioContainerRef = useRef<HTMLDivElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyzerRef = useRef<AudioMotionAnalyzer | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<BlobPart[]>([]);
  const animationFrameRef = useRef<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Focus input when component mounts
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Cleanup function for audio resources
  const cleanupAudioResources = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    
    if (analyzerRef.current) {
      analyzerRef.current.stop();
    }
    
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close();
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  // Handle audio recording setup
  useEffect(() => {
    if (isRecording && audioContainerRef.current) {
      // Initialize audio analyzer
      try {
        // Create audio context
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        
        // Set up AudioMotion Analyzer
        analyzerRef.current = new AudioMotionAnalyzer(
          audioContainerRef.current,
          {
            height: 120,
            width: '100%',
            bgAlpha: 0,
            showScaleX: false,
            showScaleY: false,
            gradient: 'rainbow',
            lineWidth: 2,
            showPeaks: true,
            fillAlpha: 0.5,
            showBgColor: false,
            lumiBars: true,
            reflexAlpha: 0.25,
            reflexRatio: 0.3,
            reflexFit: true,
            showFPS: false,
            rotated: false,
            roundBars: true,
            barSpace: 0.1,
          }
        );

        // Request microphone access
        navigator.mediaDevices.getUserMedia({ audio: true })
          .then(stream => {
            streamRef.current = stream;
            
            // Set up media recorder
            mediaRecorderRef.current = new MediaRecorder(stream);
            mediaRecorderRef.current.start();

            mediaRecorderRef.current.ondataavailable = (event) => {
              audioChunksRef.current.push(event.data);
            };

            mediaRecorderRef.current.onstop = () => {
              // Create audio blob from chunks
              const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
              audioChunksRef.current = [];

              // Convert blob to base64 for processing or sending to server
              const reader = new FileReader();
              reader.readAsDataURL(audioBlob);
              reader.onloadend = () => {
                const base64Audio = reader.result;
                console.log("Audio recording completed", base64Audio);
                
                // In a real implementation, you would send this to a speech-to-text service
                // For now, let's just send a placeholder message
                onSendMessage("I've sent a voice message");
              };
            };

            // Connect to AudioMotion Analyzer
            const source = audioContextRef.current!.createMediaStreamSource(stream);
            analyzerRef.current!.connectInput(source);
            analyzerRef.current!.start();

            // Set up analyzer node for audio level
            const analyzerNode = audioContextRef.current!.createAnalyser();
            analyzerNode.fftSize = 256;
            source.connect(analyzerNode);
            
            const dataArray = new Uint8Array(analyzerNode.frequencyBinCount);
            
            const updateAudioLevel = () => {
              if (!analyzerNode || !isRecording) return;
              
              analyzerNode.getByteFrequencyData(dataArray);
              
              let sum = 0;
              for (let i = 0; i < dataArray.length; i++) {
                sum += dataArray[i];
              }
              
              const avg = sum / dataArray.length;
              const level = Math.min(avg / 128, 1);
              
              setAudioLevel(level);
              
              animationFrameRef.current = requestAnimationFrame(updateAudioLevel);
            };
            
            updateAudioLevel();
          })
          .catch(err => {
            console.error("Error accessing microphone:", err);
            setIsRecording(false);
            alert("Could not access microphone. Please check your browser permissions.");
          });
      } catch (error) {
        console.error("Error setting up audio visualization:", error);
        setIsRecording(false);
        alert("Error setting up audio recording. Please try again.");
      }
    } else if (!isRecording) {
      // Clean up when recording stops
      cleanupAudioResources();
    }

    return cleanupAudioResources;
  }, [isRecording, onSendMessage]);

  // Handle AudioMotion visualization toggle
  useEffect(() => {
    if (showAudioVisualizer && audioContainerRef.current && !isRecording) {
      try {
        // Set up audio context and analyzer
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        
        // Create AudioMotion Analyzer instance
        analyzerRef.current = new AudioMotionAnalyzer(
          audioContainerRef.current,
          {
            height: 120,
            width: '100%',
            mode: 8,
            gradient: 'prism',
            colorMode: 'gradient',
            overlay: true,
            showBgColor: false,
            showScaleX: false,
            showScaleY: false,
            showPeaks: false,
            roundBars: true,
            barSpace: 0.4,
            lumiBars: true,
            reflexAlpha: 0.3,
            reflexRatio: 0.3,
            reflexBright: 1,
            reflexFit: true,
          }
        );

        // Request audio input
        navigator.mediaDevices.getUserMedia({ audio: true })
          .then(stream => {
            streamRef.current = stream;
            
            // Connect to AudioMotion Analyzer
            const source = audioContextRef.current!.createMediaStreamSource(stream);
            analyzerRef.current!.connectInput(source);
            analyzerRef.current!.start();
            
            // Set up analyzer node for audio level visualization
            const analyzerNode = audioContextRef.current!.createAnalyser();
            analyzerNode.fftSize = 256;
            source.connect(analyzerNode);
            
            const dataArray = new Uint8Array(analyzerNode.frequencyBinCount);
            
            const updateAudioLevel = () => {
              if (!analyzerNode || !showAudioVisualizer) return;
              
              analyzerNode.getByteFrequencyData(dataArray);
              
              let sum = 0;
              for (let i = 0; i < dataArray.length; i++) {
                sum += dataArray[i];
              }
              
              const avg = sum / dataArray.length;
              const level = Math.min(avg / 128, 1);
              
              setAudioLevel(level);
              
              animationFrameRef.current = requestAnimationFrame(updateAudioLevel);
            };
            
            updateAudioLevel();
          })
          .catch(err => {
            console.error("Error accessing microphone for visualizer:", err);
            setShowAudioVisualizer(false);
            alert("Could not access microphone for visualization. Please check permissions.");
          });
      } catch (error) {
        console.error("Error setting up audio visualization:", error);
        setShowAudioVisualizer(false);
      }
    } else if (!showAudioVisualizer && !isRecording) {
      // Clean up when visualizer is closed
      cleanupAudioResources();
    }

    return () => {
      if (!isRecording) {
        cleanupAudioResources();
      }
    };
  }, [showAudioVisualizer, isRecording]);

  const handleSendMessage = () => {
    if (message.trim()) {
      onSendMessage(message);
      setMessage('');
    }
  };

  const toggleRecording = () => {
    setShowAudioVisualizer(false); // Ensure visualizer is closed when recording
    setIsRecording(!isRecording);
    if (isRecording && mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
    }
  };

  const toggleAudioVisualizer = () => {
    if (isRecording) return; // Don't toggle visualizer during recording
    
    setShowAudioVisualizer(!showAudioVisualizer);
  };

  const handleCaptureImage = (imageData: string) => {
    setShowCamera(false);
    // In a real app, you would process and send the image
    console.log("Image captured:", imageData);
    onSendMessage(`[Image attachment]`);
  };

  // Menu animation variants
  const menuVariants = {
    hidden: { opacity: 0, scale: 0.8, y: 10 },
    visible: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring', stiffness: 400, damping: 25 } },
    exit: { opacity: 0, scale: 0.8, y: 10, transition: { duration: 0.2 } }
  };

  return (
    <>
      <div className="relative">
        {/* Audio visualization container */}
        <AnimatePresence>
          {(isRecording || showAudioVisualizer) && (
            <motion.div
              className="absolute bottom-full left-0 right-0 mb-3"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="p-3 bg-app-gray-100 rounded-2xl shadow-sm">
                <div
                  ref={audioContainerRef}
                  className="w-full h-[120px] rounded-lg overflow-hidden bg-black bg-opacity-5"
                />
                
                {/* Alternative Siri-like waveform */}
                <SiriWaveform 
                  isActive={isRecording || showAudioVisualizer} 
                  amplitude={audioLevel}
                  color={isRecording ? 'rgba(255, 45, 85, 0.7)' : 'multicolor'}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Input bar */}
        <motion.div
          className={`bg-app-gray-200 rounded-full p-2 px-4 flex items-center relative overflow-hidden ${
            showAudioVisualizer ? 'border-2 border-app-blue' : ''
          }`}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {/* + button with menu */}
          <div className="relative">
            <motion.button
              className="w-9 h-9 rounded-full bg-app-gray-300 flex items-center justify-center"
              whileHover={{ scale: 1.05, backgroundColor: 'rgb(209, 209, 214)' }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <span className="text-lg text-gray-700">+</span>
            </motion.button>

            <AnimatePresence>
              {isMenuOpen && (
                <motion.div
                  className="absolute bottom-full left-0 mb-2 bg-white rounded-lg shadow-lg p-2 min-w-[140px] border border-app-gray-200 z-10"
                  variants={menuVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  <motion.button
                    className="flex items-center w-full text-left p-2 hover:bg-app-gray-100 rounded"
                    whileHover={{ x: 2 }}
                    onClick={() => {
                      setIsMenuOpen(false);
                      setShowCamera(true);
                    }}
                  >
                    <svg className="w-5 h-5 mr-2 text-app-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Camera
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Animated gradient line */}
          {message && (
            <motion.div 
              className="absolute bottom-0 left-0 h-[2px] bg-gradient-to-r from-app-blue via-app-purple to-app-pink"
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 0.3 }}
            />
          )}

          {/* Text input */}
          <input
            ref={inputRef}
            type="text"
            className="flex-1 bg-transparent border-none outline-none mx-3 py-2 text-gray-800 placeholder-app-gray-500"
            placeholder={showAudioVisualizer ? "Speaking..." : "Type a message..."}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            disabled={showAudioVisualizer} // Disable during audio visualization
          />

          {/* Audio visualizer toggle button (always visible) */}
          <motion.button
            className={`w-9 h-9 mr-2 rounded-full flex items-center justify-center ${
              showAudioVisualizer ? 'bg-app-blue text-white' : 'bg-app-gray-300 text-gray-700'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleAudioVisualizer}
            disabled={isRecording} // Disable during recording
            animate={{
              scale: showAudioVisualizer ? [1, 1.1, 1] : 1,
              transition: {
                duration: 1.5,
                repeat: showAudioVisualizer ? Infinity : 0,
                repeatType: "reverse"
              }
            }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
            </svg>
          </motion.button>

          {/* Send or record button based on if there's text */}
          {message ? (
            <motion.button
              className="w-9 h-9 rounded-full bg-app-blue flex items-center justify-center text-white"
              whileHover={{ scale: 1.05, backgroundColor: '#0062CC' }}
              whileTap={{ scale: 0.95 }}
              initial={{ scale: 0, rotate: -45 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 45 }}
              onClick={handleSendMessage}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </motion.button>
          ) : (
            <motion.button
              className={`w-9 h-9 rounded-full flex items-center justify-center ${
                isRecording ? 'bg-red-500 text-white' : 'bg-app-gray-300 text-gray-700'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleRecording}
              disabled={showAudioVisualizer} // Disable during audio visualization
            >
              {isRecording ? (
                <motion.div
                  animate={{
                    scale: [1, 1.2, 1],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                  }}
                  className="w-3 h-3 rounded-full bg-white"
                />
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              )}
            </motion.button>
          )}
        </motion.div>
      </div>

      {/* Camera component */}
      <AnimatePresence>
        {showCamera && (
          <CameraCapture
            onCapture={handleCaptureImage}
            onClose={() => setShowCamera(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default InputBar;
