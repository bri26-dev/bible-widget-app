import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import useTheme from "../hooks/useTheme";

export default function UserSetup({ onSave }) {
  const [name, setName] = useState("");
  const [gender, setGender] = useState("");
  const [month, setMonth] = useState("");
  const [day, setDay] = useState("");

  const [displayText, setDisplayText] = useState("");
  const { theme, setTheme } = useTheme();

  const [errors, setErrors] = useState({
    name: false,
    gender: false,
    birthday: false,
  });

  const [entering, setEntering] = useState(false);

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

  const validate = () => {
    const monthNum = parseInt(month);
    const dayNum = parseInt(day);

    const newErrors = {
      name: !name.trim(),
      gender: !gender,
      birthday:
        !month ||
        !day ||
        isNaN(monthNum) ||
        isNaN(dayNum) ||
        monthNum < 1 ||
        monthNum > 12 ||
        dayNum < 1 ||
        dayNum > 31,
    };

    setErrors(newErrors);

    return !Object.values(newErrors).includes(true);
  };

  const handleSubmit = () => {
    if (!validate()) {
      vibrate();
      return;
    }

    setEntering(true);

    const userData = {
      name,
      gender,
      birthday: {
        month,
        day,
      },
      theme,
      createdAt: new Date().toISOString(),
    };

    localStorage.setItem("user", JSON.stringify(userData));

    setTimeout(() => {
      onSave(userData);
    }, 1200);
  };

  // 🎨 THEMES
  const themes = {
    pink: {
      bg: "from-pink-100 via-pink-200 to-pink-300",
      color: "bg-pink-300",
      glow: "rgba(255,182,193,0.6)",
    },
    blue: {
      bg: "from-blue-100 via-blue-200 to-blue-300",
      color: "bg-blue-300",
      glow: "rgba(147,197,253,0.6)",
    },
    purple: {
      bg: "from-purple-100 via-purple-200 to-purple-300",
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
      <audio ref={audioRef} src="/assets/ambient.mp3" />

      {/* 🌌 PORTAL */}
      <AnimatePresence>
        {entering && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 6, opacity: 1 }}
            transition={{ duration: 1.2 }}
            className="absolute w-40 h-40 rounded-full z-50"
            style={{
              background: `radial-gradient(circle, white 0%, ${currentTheme.glow} 40%, transparent 70%)`,
            }}
          />
        )}
      </AnimatePresence>

      {/* 🎨 THEME SWITCH */}
      <div className="absolute top-4 right-4 flex gap-3 z-40">
        {Object.keys(themes).map((t) => (
          <button
            key={t}
            onClick={(e) => {
              e.stopPropagation();
              setTheme(t);
            }}
          >
            <div
              className={`w-6 h-6 rounded-full ${themes[t].color} ${
                theme === t ? "scale-110" : "opacity-70"
              }`}
            />
          </button>
        ))}
      </div>

      {/* 💎 CARD */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{
          opacity: entering ? 0 : 1,
          y: entering ? -40 : 0,
        }}
        className="relative z-10 w-80 p-6 bg-white/70 backdrop-blur-md rounded-[6px] shadow-lg"
      >
        <h1 className="text-[20px] text-center text-gray-700 mb-3">
          Welcome🌸
        </h1>

        <p className="text-[14px] text-gray-600 mb-3">{displayText}</p>

        {/* NAME */}
        <input
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setErrors((prev) => ({ ...prev, name: false }));
          }}
          placeholder="Enter your name..."
          className={`w-full px-3 py-2 rounded-lg border text-[13px] mb-2 ${
            errors.name ? "border-red-400" : "border-gray-200"
          }`}
        />
        {errors.name && (
          <p className="text-[11px] text-red-500">Name is required</p>
        )}

        <p className="text-[14px] text-gray-600 mb-3">Gender</p>

        {/* GENDER */}
        <div className="flex gap-2 mt-3 mb-1">
          {["👨Male", "👩Female", "🤖Other"].map((g) => (
            <button
              key={g}
              onClick={() => {
                setGender(g);
                setErrors((prev) => ({ ...prev, gender: false }));
              }}
              className={`flex-1 py-2 text-[12px] rounded-lg transition ${
                gender === g
                  ? "bg-pink-300 text-white"
                  : errors.gender
                    ? "bg-red-100 text-red-500"
                    : "bg-white/70 text-gray-600"
              }`}
            >
              {g}
            </button>
          ))}
        </div>
        {errors.gender && (
          <p className="text-[11px] text-red-500">Select a gender</p>
        )}

        <p className="text-[14px] text-gray-600 mb-3">Birthday</p>

        {/* 🎂 BIRTHDAY */}
        <div className="flex gap-2 mt-3">
          <input
            type="number"
            placeholder="Month (1-12)"
            value={month}
            onChange={(e) => {
              setMonth(e.target.value);
              setErrors((prev) => ({ ...prev, birthday: false }));
            }}
            className={`w-1/2 px-3 py-2 rounded-lg border text-[12px] ${
              errors.birthday ? "border-red-400" : "border-gray-200"
            }`}
          />

          <input
            type="number"
            placeholder="Day (1-31)"
            value={day}
            onChange={(e) => {
              setDay(e.target.value);
              setErrors((prev) => ({ ...prev, birthday: false }));
            }}
            className={`w-1/2 px-3 py-2 rounded-lg border text-[12px] ${
              errors.birthday ? "border-red-400" : "border-gray-200"
            }`}
          />
        </div>
        {errors.birthday && (
          <p className="text-[11px] text-red-500 mt-1">
            Enter a valid birthday
          </p>
        )}

        {/* ENTER */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={handleSubmit}
          className="mt-5 w-full py-2 rounded-lg bg-gradient-to-r from-pink-300 to-pink-400 text-white text-[13px]"
        >
          Enter ✨
        </motion.button>
      </motion.div>
    </div>
  );
}
