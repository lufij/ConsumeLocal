import { ShoppingCart } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

type FloatingCartButtonProps = {
  cartCount: number;
  onClick: () => void;
  show: boolean;
};

export function FloatingCartButton({ cartCount, onClick, show }: FloatingCartButtonProps) {
  const [pulse, setPulse] = useState(false);
  const [prevCount, setPrevCount] = useState(cartCount);

  useEffect(() => {
    if (cartCount > prevCount) {
      setPulse(true);
      setTimeout(() => setPulse(false), 600);
    }
    setPrevCount(cartCount);
  }, [cartCount, prevCount]);

  if (!show) return null;

  return (
    <AnimatePresence>
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ 
          scale: pulse ? [1, 1.2, 1] : 1, 
          opacity: 1 
        }}
        exit={{ scale: 0, opacity: 0 }}
        transition={{ duration: 0.3 }}
        onClick={onClick}
        className="fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-[100] bg-emerald-600 hover:bg-emerald-700 text-white rounded-full p-4 shadow-2xl flex items-center gap-3 group transition-all hover:scale-105 active:scale-95"
      >
        <div className="relative">
          <ShoppingCart className="w-6 h-6" />
          {cartCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: pulse ? [1, 1.3, 1] : 1 }}
              className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center"
            >
              {cartCount}
            </motion.span>
          )}
        </div>
        <span className="text-sm max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 whitespace-nowrap">
          Ver Carrito
        </span>
      </motion.button>
    </AnimatePresence>
  );
}