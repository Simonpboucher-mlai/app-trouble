import { useState, useRef, useEffect } from 'react';
import { motion, useAnimation, useMotionValue, useTransform } from 'framer-motion';

interface DiagnosisButtonProps {
  onStart: () => void;
}

const DiagnosisButton: React.FC<DiagnosisButtonProps> = ({ onStart }) => {
  const [isHovered, setIsHovered] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const controls = useAnimation();
  
  // For tilt effect
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-100, 100], [5, -5]);
  const rotateY = useTransform(x, [-100, 100], [-5, 5]);
  
  // For pulse animation
  useEffect(() => {
    controls.start({
      scale: [1, 1.03, 1],
      transition: {
        duration: 3,
        repeat: Infinity,
        repeatType: "reverse",
        ease: "easeInOut"
      }
    });
    
    return () => {
      controls.stop();
    };
  }, [controls]);
  
  // Handle mouse move for tilt effect
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!buttonRef.current) return;
    
    const rect = buttonRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const mouseX = e.clientX - centerX;
    const mouseY = e.clientY - centerY;
    
    x.set(mouseX);
    y.set(mouseY);
  };
  
  const handleMouseLeave = () => {
    setIsHovered(false);
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      className="relative"
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.8, type: "spring", stiffness: 300, damping: 25 }}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
        perspective: "1000px"
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Enhanced multicolored halos for depth */}
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(94,92,230,0.8) 0%, rgba(0,122,255,0.5) 50%, rgba(255,45,85,0) 100%)',
          filter: 'blur(20px)',
          transform: 'scale(1.6)',
        }}
        animate={{
          scale: isHovered ? [1.6, 1.8, 1.6] : [1.6, 1.7, 1.6],
          opacity: isHovered ? [0.7, 0.9, 0.7] : [0.6, 0.7, 0.6],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          repeatType: "reverse"
        }}
      />
      
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(255,149,0,0.7) 0%, rgba(255,45,85,0.5) 50%, rgba(94,92,230,0) 100%)',
          filter: 'blur(15px)',
          transform: 'scale(1.4)',
        }}
        animate={{
          scale: isHovered ? [1.4, 1.6, 1.4] : [1.4, 1.5, 1.4],
          opacity: isHovered ? [0.8, 1, 0.8] : [0.7, 0.8, 0.7],
        }}
        transition={{
          duration: 3.5,
          repeat: Infinity,
          repeatType: "reverse",
          delay: 0.2
        }}
      />

      {/* Additional inner halo for even more visibility */}
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.3) 50%, rgba(255,255,255,0) 100%)',
          filter: 'blur(8px)',
          transform: 'scale(1.1)',
        }}
        animate={{
          scale: isHovered ? [1.1, 1.15, 1.1] : [1.1, 1.12, 1.1],
          opacity: isHovered ? [0.9, 1, 0.9] : [0.7, 0.8, 0.7],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          repeatType: "reverse",
          delay: 0.1
        }}
      />
      
      {/* Button with glass effect - enhanced size and clickability */}
      <motion.button
        ref={buttonRef}
        className="relative z-10 px-10 py-5 bg-white/90 text-gray-800 font-semibold rounded-full shadow-levitate backdrop-blur-sm cursor-pointer"
        style={{
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          textShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
          fontSize: '1.1rem',
        }}
        animate={controls}
        whileHover={{ 
          y: -5, 
          boxShadow: '0 20px 30px -10px rgba(0, 0, 0, 0.2), 0 10px 20px -5px rgba(0, 0, 0, 0.1)',
          transition: { duration: 0.3, ease: 'easeOut' }
        }}
        whileTap={{ 
          scale: 0.98,
          boxShadow: '0 10px 15px -5px rgba(0, 0, 0, 0.1), 0 4px 10px -5px rgba(0, 0, 0, 0.04)'
        }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        onClick={onStart}
      >
        <span className="relative inline-block overflow-hidden">
          <motion.span
            className="relative inline-block text-transparent bg-clip-text"
            style={{
              backgroundImage: 'linear-gradient(90deg, #007AFF, #5E5CE6, #FF9500, #FF2D55, #007AFF)',
              backgroundSize: '500% 100%',
              padding: '0 1px' // Prevent text cutoff
            }}
            animate={{
              backgroundPosition: ['0% 0%', '100% 0%', '0% 0%'],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: 'linear',
            }}
          >
            Start Diagnosis
          </motion.span>
        </span>
      </motion.button>
      
      {/* Subtle reflection */}
      <motion.div
        className="absolute left-0 right-0 mx-auto bottom-0 h-[1px] w-[90%] bg-gradient-to-r from-transparent via-white to-transparent opacity-50"
        style={{
          filter: 'blur(1px)',
        }}
        animate={{
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          repeatType: "mirror"
        }}
      />
    </motion.div>
  );
};

export default DiagnosisButton;
