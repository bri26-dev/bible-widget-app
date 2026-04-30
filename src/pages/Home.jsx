import { useState, useEffect, useRef } from "react";
import { useSwipeable } from "react-swipeable";
import { motion } from "framer-motion";

import TarotCard from "../components/TarotCard";
import ParticleTrail from "../components/ParticleTrail";

import bibleData from "../data/bible.json";
import quotesData from "../data/quotes.json";
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

  const bible = getDailyItem(bibleData);
  const quote = getDailyItem(quotesData);
  const tarot = getDailyItem(tarotData);

  // 🎵 audio control (mobile safe)
  useEffect(() => {
    if (!audioRef.current) return;

    if (playing) {
      audioRef.current.volume = 0.4;
      audioRef.current.play().catch(() => {});
    } else {
      audioRef.current.pause();
    }
  }, [playing]);

  const themeClass = {
    pink: "theme-pink",
    blue: "theme-blue",
    purple: "theme-purple",
  };

  return (
    <div
      {...handlers}
      className={`h-screen overflow-hidden font-pixel relative ${themeClass[theme]}`}
    >
      {/* ✨ PARTICLE TRAIL */}
      <ParticleTrail theme={theme} />

      {/* 🎵 Audio */}
      <audio ref={audioRef} loop src="/assets/ambient.mp3" />

      {/* 🌫 Ambient glow */}
      <div className="ambient-glow bg-pink-300 top-10 left-10"></div>
      <div className="ambient-glow bg-purple-300 bottom-10 right-10"></div>

      {/* 🎨 Controls */}
      <div className="absolute top-4 right-4 flex gap-2 text-xs z-50">
        <button
          onClick={() => setTheme("pink")}
          className="hover:scale-110 transition"
        >
          🌸
        </button>
        <button
          onClick={() => setTheme("blue")}
          className="hover:scale-110 transition"
        >
          🌊
        </button>
        <button
          onClick={() => setTheme("purple")}
          className="hover:scale-110 transition"
        >
          🍇
        </button>
        <button
          onClick={() => setPlaying(!playing)}
          className="hover:scale-110 transition"
        >
          {playing ? "🔊" : "🔇"}
        </button>
      </div>

      {/* 📱 SLIDE SECTIONS */}
      <motion.div
        className="h-full"
        animate={{ y: `-${section * 100}vh` }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
      >
        {/* 📖 BIBLE SECTION */}
        <div className="h-screen flex flex-col items-center justify-center text-center p-6">
          <h1 className="text-[32px] font-semi-bold mb-6 text-gray-700">
            🌤 Good day, {user.name}
          </h1>

          <motion.div
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setRevealed(true);
              localStorage.setItem("bibleRevealDate", todayKey);
            }}
            className="pixel-card-soft p-6 w-72 h-44 flex flex-col items-center justify-center rounded-md"
          >
            {!revealed ? (
              <p className="text-[24px] animate-pulse text-gray-600">
                ✨ Tap to reveal
              </p>
            ) : (
              <>
                <p className="text-[18px] font-semi-bold text-gray-700">
                  "{bible.text}" <br /> - {bible.reference}
                </p>

                <p className="text-[12px] mt-2 text-gray-600">
                  💬 {quote.text}
                </p>
              </>
            )}
          </motion.div>

          {revealed && (
            <button onClick={next} className="mt-10 animate-bounce text-xl">
              ⬇
            </button>
          )}
        </div>

        {/* 🔮 TAROT SECTION */}
        <div className="h-screen flex flex-col items-center justify-center">
          <TarotCard tarotData={tarotData} />

          <button onClick={prev} className="mt-10 animate-bounce text-xl">
            ⬆
          </button>
        </div>
      </motion.div>
    </div>
  );
}
