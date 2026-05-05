import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import zodiacData from "../data/zodiac.json";
import { getZodiac } from "../utils/zodiac";
import { getTodayKey } from "../hooks/useDailyState";

export default function ZodiacCard({ user }) {
  const todayKey = getTodayKey();

  const sign = getZodiac(user.birthday.month, user.birthday.day);
  const zodiac = zodiacData.find((z) => z.sign === sign);

  // 🔮 deterministic daily pick
  const base =
    todayKey.split("").reduce((a, c) => a + c.charCodeAt(0), 0) + sign.length;

  const reading = zodiac.readings[base % zodiac.readings.length];
  const advice = zodiac.advice[base % zodiac.advice.length];

  // 📌 persistent reveal (same as bible)
  const [revealed, setRevealed] = useState(() => {
    const saved = localStorage.getItem("zodiacRevealDate");
    return saved === todayKey;
  });

  // 🎯 stage
  // 0 = vibe (symbol + sign + vibe)
  // 1 = full (reading + advice)
  const [stage, setStage] = useState(0);

  const [revealing, setRevealing] = useState(false);

  const handleReveal = () => {
    if (revealed) return;

    setRevealing(true);

    setTimeout(() => {
      setRevealed(true);
      localStorage.setItem("zodiacRevealDate", todayKey);
      setRevealing(false);
    }, 800);
  };

  const share = async () => {
    const text =
      `🌙 ${zodiac.sign} ${zodiac.symbol}\n\n` +
      `✨ ${reading}\n\n` +
      `🌿 ${advice}`;

    if (navigator.share) {
      try {
        await navigator.share({ title: "Daily Zodiac ✨", text });
      } catch {}
    } else {
      navigator.clipboard.writeText(text);
      alert("Copied ✨");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center px-6 text-center relative">
      {/* 🌌 ambient glow */}
      <motion.div
        animate={{ scale: [1, 1.2, 1], opacity: [0.25, 0.5, 0.25] }}
        transition={{ duration: 6, repeat: Infinity }}
        className="absolute w-[320px] h-[320px] bg-white/20 blur-[110px] rounded-full"
      />

      <div className="relative z-10 max-w-[320px]">
        {/* ✨ SHOW REVEAL PROMPT ONLY IF NOT REVEALED */}
        {!revealed && !revealing && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-[15px] text-gray-600 animate-pulse cursor-pointer"
            onClick={handleReveal}
          >
            🌙 Tap to reveal your cosmic guidance
          </motion.p>
        )}

        {/* 🌌 portal animation */}
        <AnimatePresence>
          {revealing && (
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 2, opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
              className="w-32 h-32 bg-white/80 blur-3xl rounded-full mx-auto"
            />
          )}
        </AnimatePresence>

        {/* 💎 MAIN CARD */}
        {revealed && (
          <motion.div
            initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.8 }}
            className="bg-white/60 backdrop-blur-md p-6 rounded-xl shadow-lg space-y-4 mt-4"
          >
            {/* 🌙 symbol */}
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="text-[34px]"
            >
              {zodiac.symbol}
            </motion.div>

            {/* 🪐 sign */}
            <p className="text-[18px] text-gray-800 tracking-wide">
              {zodiac.sign}
            </p>

            {/* 🔁 CONTENT SWITCH */}
            <AnimatePresence mode="wait">
              {stage === 0 && (
                <motion.div
                  key="vibe"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <p className="text-[13px] text-gray-500 italic">
                    {zodiac.vibe}
                  </p>
                </motion.div>
              )}

              {stage === 1 && (
                <motion.div
                  key="full"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-3"
                >
                  <p className="text-[14px] text-gray-700 leading-relaxed">
                    ✨ {reading}
                  </p>

                  <p className="text-[13px] text-gray-600 italic">
                    🌿 {advice}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* 🔘 CONTROLS */}
            <div className="flex justify-center gap-6 pt-4 text-sm">
              {stage === 0 ? (
                <>
                  <button
                    onClick={() => setStage(1)}
                    className="opacity-70 hover:opacity-100 transition"
                  >
                    🌿 Advice
                  </button>

                  <button
                    onClick={share}
                    className="opacity-70 hover:opacity-100 transition"
                  >
                    📤 Share
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setStage(0)}
                    className="opacity-70 hover:opacity-100 transition"
                  >
                    🔙 Return
                  </button>

                  <button
                    onClick={share}
                    className="opacity-70 hover:opacity-100 transition"
                  >
                    📤 Share
                  </button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
