import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface TinyWinMessage {
  emoji: string;
  message: string;
  id: number;
}

let globalShow: ((emoji: string, message: string) => void) | null = null;

export const showTinyWin = (emoji: string, message: string) => {
  globalShow?.(emoji, message);
};

const TinyWin = () => {
  const [current, setCurrent] = useState<TinyWinMessage | null>(null);
  const [queue, setQueue] = useState<TinyWinMessage[]>([]);
  let idCounter = 0;

  const show = useCallback((emoji: string, message: string) => {
    const msg = { emoji, message, id: ++idCounter };
    setQueue((q) => [...q, msg]);
  }, []);

  useEffect(() => {
    globalShow = show;
    return () => { globalShow = null; };
  }, [show]);

  useEffect(() => {
    if (!current && queue.length > 0) {
      setCurrent(queue[0]);
      setQueue((q) => q.slice(1));
    }
  }, [current, queue]);

  useEffect(() => {
    if (current) {
      const timer = setTimeout(() => setCurrent(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [current]);

  return (
    <AnimatePresence>
      {current && (
        <motion.div
          className="fixed bottom-24 md:bottom-8 left-1/2 z-50 -translate-x-1/2 bg-foreground text-background px-5 py-3 rounded-2xl shadow-lg flex items-center gap-3 max-w-[90vw]"
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 40, opacity: 0 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
        >
          <span className="text-xl">{current.emoji}</span>
          <span className="text-sm font-bold">{current.message}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TinyWin;
