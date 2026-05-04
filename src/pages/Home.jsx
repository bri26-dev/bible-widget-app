import { useState, useEffect, useRef } from "react";
import { useSwipeable } from "react-swipeable";
import { motion } from "framer-motion";

import TarotCard from "../components/TarotCard";
import ParticleTrail from "../components/ParticleTrail";

import bibleData from "../data/bible.json";
import tarotData from "../data/tarot.json";

import { getTodayKey } from "../hooks/useDailyState";
import { getDailyItem } from "../hooks/useDailyContent";
import useTheme from "../hooks/useTheme";

export default function Home({ user }) {
  const [section, setSection] = useState(0);
  const { theme, setTheme } = useTheme();

  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);

  const todayKey = getTodayKey();

  const [revealed, setRevealed] = useState(() => {
    const saved = localStorage.getItem("bibleRevealDate");
    return saved === todayKey;
  });

  const next = () => section < 1 && setSection((s) => s + 1);
  const prev = () => section > 0 && setSection((s) => s - 1);

  const handlers = useSwipeable({
    onSwipedUp: next,
    onSwipedDown: prev,
    trackMouse: true,
    preventScrollOnSwipe: true,
  });

  // 🔁 refresh key (NEW LOGIC)
  const [refreshKey, setRefreshKey] = useState(0);

  const bible = getDailyItem(bibleData, refreshKey);

  // 🎨 unified themes
  const themes = {
    pink: {
      bg: "from-pink-100 via-pink-200 to-pink-300",
      emojis: ["🌸", "💖", "✨"],
      glow: "rgba(255,182,193,0.5)",
    },
    blue: {
      bg: "from-blue-100 via-blue-200 to-blue-300",
      emojis: ["💧", "🌊", "✨"],
      glow: "rgba(147,197,253,0.5)",
    },
    purple: {
      bg: "from-purple-100 via-purple-200 to-purple-300",
      emojis: ["🍇", "🌙", "✨"],
      glow: "rgba(196,181,253,0.5)",
    },
  };

  const currentTheme = themes[theme];

  // 🎵 audio
  useEffect(() => {
    if (!audioRef.current) return;

    if (playing) {
      audioRef.current.volume = 0.4;
      audioRef.current.play().catch(() => {});
    } else {
      audioRef.current.pause();
    }
  }, [playing]);

  // 🌅 NEW GREETING SYSTEM
  const getGreeting = () => {
    const hour = new Date().getHours();

    if (hour >= 6 && hour < 12) return { text: "Good morning", emoji: "🌅" };
    if (hour === 12) return { text: "Good noon", emoji: "☀️" };
    if (hour > 12 && hour < 18) return { text: "Good afternoon", emoji: "🌇" };
    return { text: "Good evening", emoji: "🌙" };
  };

  const { text, emoji } = getGreeting();

  const [greetText, setGreetText] = useState("");
  const fullGreet = `${emoji} ${text}, ${user.name}`;

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      setGreetText(fullGreet.slice(0, i));
      i++;
      if (i > fullGreet.length) clearInterval(interval);
    }, 35);

    return () => clearInterval(interval);
  }, [user.name]);

  // 🌌 reveal animation state
  const [revealing, setRevealing] = useState(false);
  const [showMessage, setShowMessage] = useState(false);

  // 🔁 REFRESH FIXED (NO REVEAL RESET)
  const nextMessage = () => {
    if (!showMessage) {
      // first click → reveal message
      setShowMessage(true);
    } else {
      // next clicks → go to next content + reset view
      setRefreshKey((k) => k + 1);
      setShowMessage(false);
    }
  };

  const shareVerse = async () => {
    const text = showMessage
      ? `✨ ${bible.message}`
      : `"${bible.text}" — ${bible.reference}\n\n💬 ${bible.quote}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "Daily Message ✨",
          text,
        });
      } catch {}
    } else {
      navigator.clipboard.writeText(text);
      alert("Copied to clipboard ✨");
    }
  };

  return (
    <div
      {...handlers}
      className={`h-screen overflow-hidden font-pixel relative bg-gradient-to-b ${currentTheme.bg}`}
    >
      <ParticleTrail theme={theme} />
      <audio ref={audioRef} loop src="/assets/ambient.mp3" />

      {/* 🌫 ambient blobs */}
      <div className="absolute w-80 h-80 bg-white/20 blur-3xl rounded-full top-10 left-10"></div>
      <div className="absolute w-80 h-80 bg-white/20 blur-3xl rounded-full bottom-10 right-10"></div>

      {/* ✨ floating particles */}
      {[...Array(10)].map((_, i) => {
        const emoji =
          currentTheme.emojis[
            Math.floor(Math.random() * currentTheme.emojis.length)
          ];

        return (
          <motion.div
            key={i}
            initial={{ y: 0, opacity: 0 }}
            animate={{
              y: -250,
              opacity: [0, 1, 0],
              x: Math.random() * 80 - 40,
            }}
            transition={{
              duration: 6 + Math.random() * 3,
              repeat: Infinity,
              delay: Math.random() * 4,
            }}
            className="absolute text-white/60 text-lg pointer-events-none"
            style={{
              left: `${Math.random() * 100}%`,
              bottom: "-20px",
            }}
          >
            {emoji}
          </motion.div>
        );
      })}

      {/* 💎 controls */}
      <div className="absolute top-4 right-4 flex gap-2 z-50">
        {Object.keys(themes).map((t) => (
          <button key={t} onClick={() => setTheme(t)} className="relative">
            <div
              className={`w-6 h-6 rounded-full ${
                t === "pink"
                  ? "bg-pink-300"
                  : t === "blue"
                    ? "bg-blue-300"
                    : "bg-purple-300"
              } ${theme === t ? "scale-110" : "opacity-70"}`}
              style={{
                boxShadow: theme === t ? `0 0 12px ${themes[t].glow}` : "none",
              }}
            />
            {theme === t && (
              <div className="absolute inset-0 border-2 border-white rounded-full animate-pulse"></div>
            )}
          </button>
        ))}

        <button onClick={() => setPlaying(!playing)}>
          {playing ? "🔊" : "🔇"}
        </button>
      </div>

      {/* 📱 sections */}
      <motion.div
        className="h-full"
        animate={{ y: `-${section * 100}vh` }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
      >
        <div className="h-screen flex flex-col items-center justify-start text-center px-6 pt-24 relative overflow-hidden">
          {/* 🌅 GREETING */}
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[24px] text-gray-700 tracking-wide"
          >
            {greetText}
          </motion.h1>

          {/* ✨ FLEX SPACER (push content to center) */}
          <div className="flex-1 flex items-center justify-center w-full">
            {/* 🌌 glow */}
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.5, 0.3],
              }}
              transition={{ duration: 6, repeat: Infinity }}
              className="absolute w-[400px] h-[400px] bg-white/20 blur-[120px] rounded-full"
            />

            {/* ✨ TAP AREA */}
            <div
              onClick={() => {
                if (!revealed) {
                  setRevealing(true);

                  setTimeout(() => {
                    setRevealed(true);
                    localStorage.setItem("bibleRevealDate", todayKey);
                    setRevealing(false);
                  }, 900);
                }
              }}
              className="relative z-10 max-w-[320px]"
            >
              {!revealed && !revealing && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-[18px] text-gray-600 animate-pulse"
                >
                  ✨ Tap to receive today's message
                </motion.p>
              )}

              {revealing && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1.8 }}
                  transition={{ duration: 0.9, ease: "easeOut" }}
                  className="w-32 h-32 bg-white/80 blur-3xl rounded-full mx-auto"
                />
              )}

              {revealed && (
                <motion.div
                  key={refreshKey + (showMessage ? "-msg" : "-main")}
                  initial={{ opacity: 0, y: 30, filter: "blur(12px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  transition={{ duration: 1 }}
                  className="space-y-4 text-center"
                >
                  {/* 📜 DEFAULT VIEW */}
                  {!showMessage && (
                    <>
                      <p className="text-[18px] leading-relaxed text-gray-800 font-light tracking-wide">
                        “{bible.text}”
                      </p>

                      <p className="text-[13px] text-gray-500 tracking-wider">
                        — {bible.reference}
                      </p>

                      <p className="text-[13px] italic text-gray-600">
                        💬 {bible.quote}
                      </p>
                    </>
                  )}

                  {/* ✨ MESSAGE VIEW */}
                  {showMessage && (
                    <p className="text-[15px] text-gray-700 leading-relaxed px-2">
                      ✨ {bible.message}
                    </p>
                  )}

                  {/* 🔘 ACTIONS */}
                  <div className="flex justify-center gap-6 p-8 text-sm">
                    <button
                      onClick={nextMessage}
                      className="opacity-70 hover:opacity-100 transition"
                    >
                      {showMessage ? "➡ Return" : "🌿 Reflect"}
                    </button>

                    <button
                      onClick={shareVerse}
                      className="opacity-70 hover:opacity-100 transition"
                    >
                      📤 Share
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          </div>

          {/* ⬇ NAV */}
          {revealed && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={next}
              className="mb-10 text-2xl animate-bounce"
            >
              ⬇
            </motion.button>
          )}
        </div>

        {/* 🔮 TAROT */}
        <div className="h-screen flex flex-col items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <TarotCard tarotData={tarotData} />
          </motion.div>

          <button onClick={prev} className="mt-10 text-2xl animate-bounce">
            ⬆
          </button>
        </div>
      </motion.div>
    </div>
  );
}
