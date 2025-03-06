import { motion } from 'framer-motion';

interface AnimatedTextProps {
  text: string;
  delay?: number;
  staggerDelay?: number;
  className?: string;
}

const AnimatedText: React.FC<AnimatedTextProps> = ({ 
  text, 
  delay = 0, 
  staggerDelay = 0.02, 
  className = '' 
}) => {
  // Create an array of letters from the text
  const letters = Array.from(text);

  // Variants for container animation
  const container = {
    hidden: { opacity: 0 },
    visible: (i = 1) => ({
      opacity: 1,
      transition: { staggerChildren: staggerDelay, delayChildren: delay * i },
    }),
  };

  // Variants for each letter
  const child = {
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        damping: 12,
        stiffness: 200,
      },
    },
    hidden: {
      opacity: 0,
      y: 20,
      transition: {
        type: 'spring',
        damping: 12,
        stiffness: 200,
      },
    },
  };

  return (
    <motion.span
      style={{ display: 'inline-block' }}
      variants={container}
      initial="hidden"
      animate="visible"
      className={className}
    >
      {letters.map((letter, index) => (
        <motion.span 
          key={index} 
          variants={child}
          style={{ display: 'inline-block', whiteSpace: 'pre' }}
        >
          {letter === ' ' ? ' ' : letter}
        </motion.span>
      ))}
    </motion.span>
  );
};

export default AnimatedText;
