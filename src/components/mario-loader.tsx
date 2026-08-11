'use client';

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play } from "lucide-react";

export function MarioLoader() {
  const [show, setShow] = useState(true);

  useEffect(() => {
    // Quick hide to simulate snappiness of YouTube's load transitions
    const timer = setTimeout(() => {
      setShow(false);
    }, 900);

    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background select-none"
        >
          {/* Top YouTube-style red loading progress bar */}
          <motion.div
            initial={{ width: "0%" }}
            animate={{ width: ["0%", "45%", "85%", "100%"] }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="absolute top-0 left-0 h-1 bg-primary z-50 shadow-[0_0_8px_rgba(255,0,0,0.5)]"
          />

          {/* Centered MarioTube Logo Branding */}
          <div className="flex flex-col items-center space-y-4">
            <div className="flex items-center gap-2.5">
              {/* Mario Kart Steering Wheel Play Logo */}
              <svg viewBox="0 0 100 100" className="h-16 w-16 animate-[spin_8s_linear_infinite] shrink-0" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="50" cy="50" r="42" stroke="currentColor" strokeWidth="10" className="text-zinc-800 dark:text-zinc-200" />
                <path d="M 50,8 A 42,42 0 0,1 92,50" stroke="#f83800" strokeWidth="10" fill="none" />
                <path d="M 8,50 A 42,42 0 0,1 50,8" stroke="#f83800" strokeWidth="10" fill="none" />
                <path d="M 50,50 L 50,15" stroke="currentColor" strokeWidth="8" className="text-zinc-400 dark:text-zinc-600" />
                <path d="M 50,50 L 20,68" stroke="currentColor" strokeWidth="8" className="text-zinc-400 dark:text-zinc-600" />
                <path d="M 50,50 L 80,68" stroke="currentColor" strokeWidth="8" className="text-zinc-400 dark:text-zinc-600" />
                <circle cx="50" cy="50" r="18" fill="#f83800" stroke="#ffffff" strokeWidth="3" />
                <polygon points="46,41 60,50 46,59" fill="#ffffff" />
              </svg>
              
              {/* Mario theme colors for text to respect user's choice */}
              <span className="flex items-center font-display font-extrabold text-3xl uppercase tracking-tighter drop-shadow-[0_2px_0_rgba(0,0,0,0.8)]">
                <span className="text-[#f83800]">M</span>
                <span className="text-[#f8b800] -ml-0.5">a</span>
                <span className="text-[#002cf8] -ml-0.5">r</span>
                <span className="text-[#00b02f] -ml-0.5">i</span>
                <span className="text-[#f83800] -ml-0.5">o</span>
                <span className="text-[#002cf8] ml-1">T</span>
                <span className="text-[#f8b800] -ml-0.5">u</span>
                <span className="text-[#00b02f] -ml-0.5">b</span>
                <span className="text-[#f83800] -ml-0.5">e</span>
              </span>
            </div>
            
            {/* Spinning Loader Ring */}
            <div className="w-8 h-8 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
