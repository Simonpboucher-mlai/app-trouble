import { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Message } from 'ai';
import InputBar from '../InputBar';
import AnimatedText from '../Animations/AnimatedText';

interface ChatInterfaceProps {
  messages: Message[];
  onSendMessage: (message: string) => void;
  isLoading: boolean;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ 
  messages, 
  onSendMessage, 
  isLoading 
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Different variants for user and assistant messages
  const userMessageVariants = {
    initial: { opacity: 0, x: 20, y: 10 },
    animate: { opacity: 1, x: 0, y: 0, transition: { type: 'spring', stiffness: 500, damping: 30 } },
    exit: { opacity: 0, x: 20, transition: { duration: 0.2 } }
  };

  const assistantMessageVariants = {
    initial: { opacity: 0, x: -20, y: 10 },
    animate: { opacity: 1, x: 0, y: 0, transition: { type: 'spring', stiffness: 500, damping: 30 } },
    exit: { opacity: 0, x: -20, transition: { duration: 0.2 } }
  };

  return (
    <>
      <motion.div 
        className="flex items-center justify-center p-3 border-b border-gray-200"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.3 }}
      >
        <h1 className="text-lg font-semibold text-gray-800">AI Diagnosis Assistant</h1>
      </motion.div>
      
      <div className="flex-1 overflow-auto p-4">
        <div className="space-y-4">
          <AnimatePresence initial={false}>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                variants={message.role === 'user' ? userMessageVariants : assistantMessageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] p-3.5 rounded-2xl ${
                    message.role === 'user'
                      ? 'bg-app-blue text-white rounded-tr-none shadow-lg'
                      : 'bg-app-gray-200 text-gray-800 rounded-tl-none shadow-sm'
                  }`}
                >
                  {message.role === 'assistant' ? (
                    <AnimatedText text={message.content} staggerDelay={0.01} />
                  ) : (
                    message.content
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="bg-app-gray-200 text-gray-800 p-3.5 rounded-2xl rounded-tl-none shadow-sm">
                <div className="flex space-x-2">
                  {[0, 1, 2].map((i) => (
                    <motion.div 
                      key={i}
                      className="w-2 h-2 bg-app-gray-500 rounded-full"
                      animate={{
                        y: ['0%', '-50%', '0%'],
                        opacity: [0.5, 1, 0.5]
                      }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        delay: i * 0.15
                      }}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      <motion.div 
        className="p-4 pt-2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.3 }}
      >
        <InputBar onSendMessage={onSendMessage} />
      </motion.div>
    </>
  );
};

export default ChatInterface;
