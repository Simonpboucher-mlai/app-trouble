import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useAnimation, useMotionValue, useTransform } from 'framer-motion';
import DiagnosisButton from './components/DiagnosisButton';
import ChatInterface from './components/ChatInterface';
import { useChat } from 'ai/react';
import { createParticles, removeParticles } from './utils/particleEffects';
import DynamicAudioVisualizer from './components/AudioVisualizer/DynamicAudioVisualizer';

const App = () => {
  console.log('App component rendering');
  
  const [isDiagnosisStarted, setIsDiagnosisStarted] = useState(false);
  const [showParticles, setShowParticles] = useState(false);
  const [showEvaporationEffect, setShowEvaporationEffect] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const appContainerRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<HTMLCanvasElement | null>(null);
  
  // Motion values for smooth scroll parallax
  const scrollY = useMotionValue(0);
  const backgroundY = useTransform(scrollY, [0, 500], [0, -50]);
  
  const { messages, append, isLoading, error } = useChat({
    api: '/api/chat',
    initialMessages: [],
    onError: (error) => {
      console.error("Chat API error:", error);
      setApiError("Une erreur s'est produite lors de la communication avec l'API. Veuillez réessayer plus tard.");
    }
  });

  // Track API errors
  useEffect(() => {
    if (error) {
      console.error("Chat API error:", error);
      setApiError("Une erreur s'est produite lors de la communication avec l'API. Veuillez réessayer plus tard.");
    }
  }, [error]);

  // Track scroll position for parallax effect
  useEffect(() => {
    console.log('Scroll effect initialized');
    const handleScroll = () => {
      scrollY.set(window.scrollY);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [scrollY]);

  // Initial vapor particle effect
  useEffect(() => {
    console.log('Particle effect initialized, isDiagnosisStarted:', isDiagnosisStarted);
    if (appContainerRef.current && !isDiagnosisStarted) {
      try {
        const canvas = createParticles(appContainerRef.current);
        particlesRef.current = canvas;
        console.log('Particles created successfully');
      } catch (error) {
        console.error('Error creating particles:', error);
      }
    }
    
    return () => {
      if (particlesRef.current && !showEvaporationEffect) {
        try {
          removeParticles(particlesRef.current);
          console.log('Particles removed successfully');
        } catch (error) {
          console.error('Error removing particles:', error);
        }
      }
    };
  }, [isDiagnosisStarted, showEvaporationEffect]);
  
  const handleStartDiagnosis = () => {
    console.log('Starting diagnosis');
    setShowEvaporationEffect(true);
    
    // Dramatic evaporation effect when button is clicked
    setTimeout(() => {
      if (particlesRef.current) {
        try {
          removeParticles(particlesRef.current);
          console.log('Particles removed during transition');
        } catch (error) {
          console.error('Error removing particles during transition:', error);
        }
      }
      setShowParticles(true);
      
      // Delay before starting diagnosis to allow for animation
      setTimeout(() => {
        setShowEvaporationEffect(false);
        setShowParticles(false);
        setIsDiagnosisStarted(true);
        console.log('Diagnosis started');
        
        // Initialize chat with welcome message
        try {
          append({
            role: 'assistant',
            content: "Hello! I'm your AI diagnosis assistant. I'll help analyze your symptoms or issues. What would you like me to help diagnose today?",
            id: 'welcome-message'
          });
        } catch (error) {
          console.error("Error initializing chat:", error);
          setApiError("Une erreur s'est produite lors de l'initialisation du chat. Veuillez réessayer plus tard.");
        }
      }, 2000);
    }, 300);
  };

  const handleSendMessage = async (message: string) => {
    console.log('Sending message:', message);
    try {
      await append({
        role: 'user',
        content: message,
      });
    } catch (error) {
      console.error("Error sending message:", error);
      setApiError("Une erreur s'est produite lors de l'envoi du message. Veuillez réessayer plus tard.");
    }
  };

  return (
    <div 
      ref={appContainerRef}
      className="min-h-screen w-full flex items-center justify-center p-4 md:p-8 overflow-hidden bg-gradient-to-b from-gray-100 to-gray-200"
      style={{
        backgroundImage: `url('/subtle-texture.png')`,
        backgroundBlendMode: 'overlay',
      }}
    >
      <motion.div 
        className="absolute inset-0 z-0 opacity-50"
        style={{ 
          backgroundImage: 'linear-gradient(135deg, rgba(0,122,255,0.3) 0%, rgba(94,92,230,0.3) 25%, rgba(255,149,0,0.3) 50%, rgba(255,45,85,0.3) 75%)',
          backgroundSize: '400% 400%',
          y: backgroundY,
        }}
        animate={{
          backgroundPosition: ['0% 0%', '100% 100%'],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          repeatType: 'reverse',
          ease: 'linear',
        }}
      />
      
      <div className="relative w-full max-w-md h-[80vh] md:h-[85vh] bg-white rounded-3xl shadow-apple overflow-hidden glass">
        {apiError && (
          <div className="absolute top-0 left-0 right-0 bg-red-500 text-white p-2 text-center z-50">
            {apiError}
            <button 
              className="ml-2 font-bold"
              onClick={() => setApiError(null)}
            >
              ×
            </button>
          </div>
        )}
        
        <AnimatePresence mode="wait">
          {!isDiagnosisStarted ? (
            <motion.div
              key="start-screen"
              className="absolute inset-0 flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ 
                opacity: 0,
                filter: 'blur(10px)',
                transition: { duration: 0.8, ease: 'easeInOut' }
              }}
            >
              <DiagnosisButton onStart={handleStartDiagnosis} />
            </motion.div>
          ) : (
            <motion.div
              key="chat-screen"
              className="absolute inset-0 flex flex-col"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.3, type: 'spring', stiffness: 300, damping: 30 }}
            >
              <ChatInterface 
                messages={messages} 
                onSendMessage={handleSendMessage} 
                isLoading={isLoading} 
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Enhanced evaporation particles effect for transition */}
      <AnimatePresence>
        {showEvaporationEffect && (
          <motion.div 
            key="evaporation-effect"
            className="absolute inset-0 pointer-events-none z-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5 }}
          >
            {/* Colorful explosion effect */}
            <motion.div
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ 
                scale: [0, 1.5, 0], 
                opacity: [0, 1, 0],
              }}
              transition={{ 
                duration: 2,
                times: [0, 0.3, 1],
                ease: "easeOut" 
              }}
            >
              <div 
                className="w-64 h-64 rounded-full"
                style={{
                  background: 'radial-gradient(circle, rgba(255,255,255,0.9) 0%, rgba(94,92,230,0.8) 25%, rgba(255,149,0,0.7) 50%, rgba(255,45,85,0.5) 80%, rgba(255,255,255,0) 100%)',
                  filter: 'blur(8px)',
                }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default App;
