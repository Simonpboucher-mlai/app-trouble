import { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

interface SiriWaveformProps {
  isActive: boolean;
  amplitude?: number;
  color?: string;
}

const SiriWaveform: React.FC<SiriWaveformProps> = ({ 
  isActive, 
  amplitude = 0.5, 
  color = 'rgba(0, 122, 255, 0.5)' 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number | null>(null);

  // Normalized amplitude between 0.1 and 1
  const normalizedAmplitude = amplitude * 0.9 + 0.1;
  
  useEffect(() => {
    if (!canvasRef.current || !isActive) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas dimensions
    canvas.width = canvas.clientWidth * window.devicePixelRatio;
    canvas.height = canvas.clientHeight * window.devicePixelRatio;
    
    // Resize observer to handle window resizing
    const resizeObserver = new ResizeObserver(() => {
      canvas.width = canvas.clientWidth * window.devicePixelRatio;
      canvas.height = canvas.clientHeight * window.devicePixelRatio;
    });
    
    resizeObserver.observe(canvas);
    
    // Animation state
    let phase = 0;
    
    // Array of colors for multicolor effect
    const colors = [
      'rgba(0, 122, 255, 0.7)',  // Blue
      'rgba(94, 92, 230, 0.7)',  // Purple
      'rgba(255, 149, 0, 0.7)',  // Orange
      'rgba(255, 45, 85, 0.7)',  // Pink
      'rgba(52, 199, 89, 0.7)',  // Green
    ];
    
    // Draw wave function
    const draw = () => {
      if (!ctx) return;
      
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Center line
      const centerY = canvas.height / 2;
      
      // Number of wave lines
      const waveCount = 6;
      
      // Update phase for animation
      phase += 0.05;
      if (phase > Math.PI * 2) {
        phase = 0;
      }
      
      // Draw each wave line
      for (let i = 0; i < waveCount; i++) {
        const opacity = 1 - i * (0.7 / waveCount);
        const amplitude_scale = normalizedAmplitude * (1 - i * (0.2 / waveCount));
        
        ctx.beginPath();
        ctx.moveTo(0, centerY);
        
        // Maximum wave height based on amplitude
        const maxHeight = canvas.height * 0.3 * amplitude_scale;
        
        // Offset for each wave
        const waveOffset = (i * Math.PI / 4) + phase;
        
        // Draw curve through canvas using multiple sine waves for complexity
        for (let x = 0; x < canvas.width; x += 1) {
          const dx = x / canvas.width;
          
          // Combine multiple sine waves with different frequencies for more organic look
          const offsetY = 
            Math.sin(dx * Math.PI * 6 + waveOffset) * maxHeight * 0.6 +
            Math.sin(dx * Math.PI * 9 + waveOffset * 1.3) * maxHeight * 0.3 +
            Math.sin(dx * Math.PI * 12 + waveOffset * 0.7) * maxHeight * 0.1;
            
          ctx.lineTo(x, centerY + offsetY);
        }
        
        // Complete the path back to the start to create a closed shape
        ctx.lineTo(canvas.width, centerY);
        ctx.lineTo(0, centerY);
        
        // Use multicolor or single color based on input
        if (color === 'multicolor') {
          ctx.fillStyle = colors[i % colors.length].replace(')', `, ${opacity})`);
        } else {
          ctx.fillStyle = color.replace(')', `, ${opacity})`);
        }
        ctx.fill();
      }
      
      requestRef.current = requestAnimationFrame(draw);
    };
    
    draw();
    
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
      resizeObserver.disconnect();
    };
  }, [isActive, normalizedAmplitude, color]);
  
  return (
    <motion.div 
      className="w-full h-16 mt-1"
      initial={{ opacity: 0 }}
      animate={{ opacity: isActive ? 1 : 0 }}
      transition={{ duration: 0.5 }}
    >
      <canvas 
        ref={canvasRef} 
        className="w-full h-full"
        style={{ display: isActive ? 'block' : 'none' }}
      />
    </motion.div>
  );
};

export default SiriWaveform;
