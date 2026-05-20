import React from 'react';
import { AnimatePresence, motion } from 'motion/react';

interface ToastProps {
  message: string | null;
}

export const Toast: React.FC<ToastProps> = ({ message }) => (
  <AnimatePresence>
    {message && (
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 8, scale: 0.98 }}
        transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
        className="fixed bottom-28 left-1/2 -translate-x-1/2 z-[100] max-w-[calc(100%-2rem)] px-4 py-3 bg-gray-900/92 backdrop-blur-md text-white text-[11px] font-medium leading-relaxed rounded-2xl shadow-xl text-center pointer-events-none"
      >
        {message}
      </motion.div>
    )}
  </AnimatePresence>
);
