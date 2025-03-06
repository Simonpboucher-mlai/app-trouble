
import React, { useRef, useEffect, useState } from 'react';
import AudioMotionAnalyzer from 'audiomotion-analyzer';
import { motion } from 'framer-motion';

interface DynamicAudioVisualizerProps {
  isActive: boolean;
  audioStream?: MediaStream;
}

const DynamicAudioVisualizer: React.FC<DynamicAudioVisualizerProps> = ({ 
  isActive,
  audioStream
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const analyzerRef = useRef<AudioMotionAnalyzer | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    let cleanup = () => {};

    const initVisualizer = async () => {
      try {
        // Create audio context
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        
        // Create AudioMotion Analyzer
        analyzerRef.current = new AudioMotionAnalyzer(containerRef.current, {
          mode: 8,                        // 10 bands of frequencies (full octave mode)
          gradient: 'prism',             // predefined multicolor gradient (Dynamic Audio)
          colorMode: 'gradient',         // use gradient across all bars (default)
          overlay: true,                 // transparent canvas for overlay on background
          showBgColor: false,            // don't draw background (transparent background)
          showScaleX: false,             // hide frequency scale (X axis)
          showScaleY: false,             // hide decibel scale (Y axis)
          showPeaks: false,              // disable peak indicators on bars
          ledBars: true,                 // use LED style bars
          roundBars: true,               // use rounded bars
          barSpace: 0.4,                 // space between bars
          lumiBars: true,                // luminance bars
          reflexRatio: 0.3,              // percentage of canvas used to draw the reflection
          reflexAlpha: 0.25,             // opacity of the reflection
          reflexBright: 1,               // reflection brightness
          reflexFit: true,               // adjust reflex to fill the canvas
        });

        // Get audio stream - use provided stream or request a new one
        const stream = audioStream || await navigator.mediaDevices.getUserMedia({ audio: true });
        
        // Connect stream to analyzer
        sourceRef.current = audioContextRef.current.createMediaStreamSource(stream);
        analyzerRef.current.connectInput(sourceRef.current);
        analyzerRef.current.start();
        
        setIsInitialized(true);
        
        // Define cleanup function
        cleanup = () => {
          if (analyzerRef.current) {
            analyzerRef.current.stop();
          }
          
          if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
            audioContextRef.current.close();
          }
          
          // Only stop the stream if we created it internally
          if (!audioStream) {
            stream.getTracks().forEach(track => track.stop());
          }
        };
      } catch (error) {
        console.error('Error initializing audio visualizer:', error);
      }
    };

    initVisualizer();

    return () => cleanup();
  }, [isActive, audioStream]);

  return (
    <motion.div
      className="w-full h-full rounded-lg overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: isInitialized ? 1 : 0 }}
      transition={{ duration: 0.5 }}
    >
      <div 
        ref={containerRef} 
        className="w-full h-full" 
        style={{ 
          background: 'rgba(0,0,0,0.05)',
          borderRadius: '0.5rem'
        }}
      />
    </motion.div>
  );
};

export default DynamicAudioVisualizer;
