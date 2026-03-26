import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Coin = {
  id: number;
  left: number;
  duration: number;
  size: number;
};

export function FallingCoins() {
  const [coins, setCoins] = useState<Coin[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCoins((prev) => {
        // Keep only last 20 to prevent DOM bloat
        const updated = [...prev, {
          id: Date.now(),
          left: Math.random() * 100,
          duration: 2 + Math.random() * 2.5,
          size: 16 + Math.random() * 16
        }];
        return updated.slice(-20);
      });
    }, 600);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
      <AnimatePresence>
        {coins.map((coin) => (
          <motion.div
            key={coin.id}
            initial={{ y: -50, opacity: 0, rotate: 0 }}
            animate={{ y: "110vh", opacity: [0, 1, 1, 0], rotate: 360 }}
            transition={{ duration: coin.duration, ease: "linear" }}
            onAnimationComplete={() => {
              setCoins(prev => prev.filter(c => c.id !== coin.id));
            }}
            className="absolute text-yellow-500 drop-shadow-md"
            style={{ 
              left: `${coin.left}%`,
              fontSize: `${coin.size}px`
            }}
          >
            💰
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
