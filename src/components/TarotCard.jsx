import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { getTodayKey } from "../hooks/useDailyState";
import combinations from "../data/tarotCombinations.json";

export default function TarotCard({ tarotData }) {
  const todayKey = getTodayKey();

  // =========================
  // 🎴 DAILY SPREAD
  // =========================
  const getDailySpread = () => {
    const saved = localStorage.getItem("tarotSpread");

    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.date === todayKey) return parsed.cards;
    }

    const shuffled = [...tarotData].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 3);

    localStorage.setItem(
      "tarotSpread",
      JSON.stringify({ date: todayKey, cards: selected }),
    );

    return selected;
  };

  const spread = getDailySpread();

  const [flipped, setFlipped] = useState([false, false, false]);
  const [allFlipped, setAllFlipped] = useState(false);
  const [showMessage, setShowMessage] = useState(false);

  const labels = ["Past", "Present", "Future"];

  const flipCard = (index) => {
    if (flipped[index]) return;

    const updated = [...flipped];
    updated[index] = true;
    setFlipped(updated);
  };

  useEffect(() => {
    if (flipped.every(Boolean)) {
      setTimeout(() => setAllFlipped(true), 900);
    }
  }, [flipped]);

  // =========================
  // 🔮 SMART COMBINATION
  // =========================
  const getCombinationReading = () => {
    const cleanNames = spread.map((c) =>
      c.name.replace(/[^a-zA-Z ]/g, "").trim(),
    );

    const match = combinations.find((combo) =>
      combo.key.every((k) => cleanNames.includes(k)),
    );

    if (match) return match;

    return {
      comboTitle: "Flow of Becoming",
      message: `Your journey carries the energy of ${cleanNames[0]}, moving through ${cleanNames[1]}, and unfolding into ${cleanNames[2]}.

This is a day of quiet transformation. What you’ve been through is shaping how you respond now—and today is shaping your future.

Move with awareness. Trust the process, even if it feels unclear.`,
    };
  };

  const { comboTitle, message } = getCombinationReading();

  const handleMessageToggle = () => {
    setShowMessage((prev) => !prev);
  };

  const handleShare = async () => {
    const text = showMessage
      ? `${title}\n\n${message}`
      : spread.map((c) => c.name).join(", ");

    if (navigator.share) {
      try {
        await navigator.share({
          title: "Tarot Reading 🔮",
          text,
        });
      } catch {}
    } else {
      navigator.clipboard.writeText(text);
      alert("Copied ✨");
    }
  };

  return (
    <div className="flex flex-col items-center gap-10 px-4">
      {/* ========================= */}
      {/* 🔮 TITLE */}
      {/* ========================= */}
      <motion.h2
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-[20px] text-gray-700 tracking-wide"
      >
        🔮 Your Daily Reading
      </motion.h2>

      {/* ========================= */}
      {/* 🃏 CARD VIEW */}
      {/* ========================= */}
      {!showMessage && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-8"
        >
          <div className="flex gap-1">
            {spread.map((card, i) => (
              <motion.div
                key={i}
                initial={{ y: 60, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{
                  delay: i * 0.25,
                  duration: 1,
                  ease: "easeOut",
                }}
                whileHover={{ y: -12, scale: 1.05 }}
                className="w-32 h-56 perspective cursor-pointer"
                onClick={() => flipCard(i)}
              >
                <div
                  className={`relative w-full h-full transition-transform duration-[1000ms] ${
                    flipped[i] ? "rotate-y-180" : ""
                  }`}
                  style={{ transformStyle: "preserve-3d" }}
                >
                  {/* ========================= */}
                  {/* BACK */}
                  {/* ========================= */}
                  <div className="absolute w-full h-full backface-hidden rounded-2xl bg-gradient-to-br from-purple-200 via-white/30 to-purple-100 border border-white/40 shadow-xl flex flex-col items-center justify-center">
                    <motion.div
                      animate={{
                        opacity: [0.5, 1, 0.5],
                        scale: [1, 1.15, 1],
                      }}
                      transition={{ duration: 4, repeat: Infinity }}
                      className="text-xl"
                    >
                      ✨
                    </motion.div>

                    <p className="text-[11px] text-gray-600 mt-3">
                      {labels[i]}
                    </p>

                    <p className="text-[10px] text-gray-500">Tap to reveal</p>
                  </div>

                  {/* ========================= */}
                  {/* FRONT */}
                  {/* ========================= */}
                  <div className="absolute w-full h-full rotate-y-180 backface-hidden rounded-2xl bg-white/70 backdrop-blur-md border border-white/50 shadow-2xl p-3 flex flex-col overflow-hidden">
                    {/* ✨ glow burst */}
                    {flipped[i] && (
                      <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 2.8, opacity: 0 }}
                        transition={{ duration: 1.5 }}
                        className="absolute inset-0 bg-white/50 blur-3xl rounded-full"
                      />
                    )}

                    {/* ✨ shimmer */}
                    {flipped[i] && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: [0, 1, 0] }}
                        transition={{ duration: 2, delay: 0.3 }}
                        className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/40 to-transparent"
                      />
                    )}

                    {/* ========================= */}
                    {/* TEXT (ALIGNED + FIXED) */}
                    {/* ========================= */}
                    <div className="flex flex-col justify-between flex-1 mt-2 text-center">
                      {/* NAME */}
                      <p className="text-[13px] text-gray-900 h-[18px] flex items-center justify-center">
                        {card.name}
                      </p>

                      {/* IMAGE */}
                      <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.8 }}
                        className="h-24 w-full rounded-lg bg-white/40 flex items-center justify-center overflow-hidden"
                      >
                        {card.image ? (
                          <img
                            src={card.image}
                            alt=""
                            className="object-cover w-full h-full"
                          />
                        ) : (
                          "🔮"
                        )}
                      </motion.div>

                      {/* TITLE */}
                      <p className="text-[12px] text-gray-800 h-[8px]">
                        {card.title}
                      </p>

                      {/* MEANING */}
                      <p className="text-[10px] text-gray-600 leading-snug h-[36px] flex items-center justify-center px-1">
                        {card.meaning}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* ACTIONS */}
          {allFlipped && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex gap-6 mt-4 text-sm"
            >
              <button onClick={handleMessageToggle}>✨ Message</button>

              <button onClick={handleShare}>📤 Share</button>
            </motion.div>
          )}
        </motion.div>
      )}

      {/* ========================= */}
      {/* ✨ MESSAGE VIEW */}
      {/* ========================= */}
      {showMessage && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9, filter: "blur(12px)" }}
          animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          transition={{ duration: 1.4 }}
          className="relative bg-white/60 backdrop-blur-xl border border-white/40 p-6 rounded-2xl shadow-2xl max-w-xs text-center overflow-hidden"
        >
          {/* glow */}
          <motion.div
            animate={{
              scale: [1, 1.4, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{ duration: 7, repeat: Infinity }}
            className="absolute w-64 h-64 bg-white/30 blur-3xl rounded-full -top-10 -left-10"
          />

          <h3 className="text-[15px] font-semibold text-gray-800 mb-3 relative z-10">
            ✨ {comboTitle}
          </h3>

          <div className="w-10 h-[1px] bg-gray-400/40 mx-auto mb-3"></div>

          <p className="text-[11px] text-gray-700 whitespace-pre-line leading-relaxed relative z-10">
            {message}
          </p>

          <div className="flex justify-center gap-6 mt-6 text-sm relative z-10">
            <button onClick={handleMessageToggle}>⬅ Return</button>
            <button onClick={handleShare}>📤 Share</button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
