import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import useTheme from "../hooks/useTheme";

export default function UserSetup({ onSave }) {
  const [name, setName] = useState("");
  const [displayText, setDisplayText] = useState("");
  const { theme, setTheme } = useTheme();
  const [error, setError] = useState(false);
  const [entering, setEntering] = useState(false); // 🌌 portal trigger

  const audioRef = useRef(null);

  const fullText = "What should we call you?";

  // 🪄 typewriter
  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      setDisplayText(fullText.slice(0, i));
      i++;
      if (i > fullText.length) clearInterval(interval);
    }, 35);
    return () => clearInterval(interval);
  }, []);

  // 🎵 sound
  const playSound = () => {
    if (!audioRef.current) return;
    audioRef.current.volume = 0.4;
    audioRef.current.play().catch(() => {});
  };

  const vibrate = () => {
    if (navigator.vibrate) navigator.vibrate(50);
  };

  const handleSubmit = () => {
    if (!name.trim()) {
      setError(true);
      vibrate();
      setTimeout(() => setError(false), 600);
      return;
    }

    // 🌌 trigger portal first
    setEntering(true);

    const userData = {
      name,
      theme,
      createdAt: new Date().toISOString(),
    };

    localStorage.setItem("user", JSON.stringify(userData));

    // delay to allow animation
    setTimeout(() => {
      onSave(userData);
    }, 1200);
  };

  // 🎨 THEMES
  const themes = {
    pink: {
      bg: "from-pink-100 via-pink-200 to-pink-300",
      emojis: ["🌸", "💖", "✨"],
      color: "bg-pink-300",
      glow: "rgba(255,182,193,0.6)",
    },
    blue: {
      bg: "from-blue-100 via-blue-200 to-blue-300",
      emojis: ["💧", "🌊", "✨"],
      color: "bg-blue-300",
      glow: "rgba(147,197,253,0.6)",
    },
    purple: {
      bg: "from-purple-100 via-purple-200 to-purple-300",
      emojis: ["🍇", "🌙", "✨"],
      color: "bg-purple-300",
      glow: "rgba(196,181,253,0.6)",
    },
  };

  const currentTheme = themes[theme];

  return (
    <div
      className={`h-screen flex items-center justify-center relative overflow-hidden font-pixel bg-gradient-to-b ${currentTheme.bg}`}
      onClick={playSound}
    >
      {/* 🎵 audio */}
      <audio ref={audioRef} src="/assets/start.mp3" />

      {/* 🌌 PORTAL OVERLAY */}
      <AnimatePresence>
        {entering && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 6, opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: "easeInOut" }}
            className="absolute w-40 h-40 rounded-full z-50"
            style={{
              background: `radial-gradient(circle, white 0%, ${currentTheme.glow} 40%, transparent 70%)`,
            }}
          />
        )}
      </AnimatePresence>

      {/* 💎 THEME SWITCHER */}
      <div className="absolute top-4 right-4 flex gap-3 z-40">
        {Object.keys(themes).map((t) => (
          <button
            key={t}
            onClick={(e) => {
              e.stopPropagation();
              setTheme(t);
            }}
            className="relative"
          >
            <div
              className={`w-7 h-7 rounded-full ${themes[t].color} transition ${
                theme === t ? "scale-110" : "opacity-70"
              }`}
              style={{
                boxShadow: theme === t ? `0 0 12px ${themes[t].glow}` : "none",
              }}
            />
            {theme === t && (
              <div className="absolute inset-0 rounded-full border-2 border-white animate-pulse"></div>
            )}
          </button>
        ))}
      </div>

      {/* ✨ FLOATING EMOJIS */}
      {[...Array(12)].map((_, i) => {
        const emoji =
          currentTheme.emojis[
            Math.floor(Math.random() * currentTheme.emojis.length)
          ];

        return (
          <motion.div
            key={i}
            initial={{ y: 0, opacity: 0 }}
            animate={{
              y: -200,
              opacity: [0, 1, 0],
              x: Math.random() * 50 - 25,
            }}
            transition={{
              duration: 6 + Math.random() * 4,
              repeat: Infinity,
              delay: Math.random() * 5,
            }}
            className="absolute text-white/60 text-lg"
            style={{
              left: `${Math.random() * 100}%`,
              bottom: "-20px",
            }}
          >
            {emoji}
          </motion.div>
        );
      })}

      {/* 💎 CARD */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{
          opacity: entering ? 0 : 1,
          y: entering ? -40 : 0,
          x: error ? [0, -8, 8, -6, 6, 0] : 0,
        }}
        transition={{ duration: 0.4 }}
        className="relative z-10 w-80 p-6 bg-white/70 backdrop-blur-md 
        shadow-[0_0_0_2px_rgba(255,255,255,0.3),_0_0_20px_rgba(255,182,193,0.4),_4px_4px_0px_rgba(0,0,0,0.15)]
        rounded-[6px]"
      >
        <h1 className="text-[20px] text-center text-gray-700 mb-3">
          Welcome🌸
        </h1>

        <p className="text-[14px] text-gray-600 mb-2 min-h-[18px]">
          {displayText}
        </p>

        <input
          type="text"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setError(false);
          }}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          placeholder="Enter your name..."
          className={`w-full px-3 py-2 rounded-lg bg-white/80 border text-[13px]
          focus:outline-none transition ${
            error
              ? "border-red-400 focus:ring-2 focus:ring-red-300"
              : "border-gray-200 focus:ring-2 focus:ring-pink-300"
          }`}
        />

        {error && (
          <p className="text-[11px] text-red-500 mt-2 animate-pulse">
            Please enter your name.
          </p>
        )}

        <motion.button
          whileTap={{ scale: 0.95 }}
          whileHover={{ scale: 1.03 }}
          onClick={handleSubmit}
          className="mt-5 w-full py-2 rounded-lg bg-gradient-to-r from-pink-300 to-pink-400 text-white text-[13px] shadow-md hover:shadow-lg transition"
        >
          Enter ✨
        </motion.button>
      </motion.div>
    </div>
  );
}
