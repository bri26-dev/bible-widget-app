import { useState, useEffect } from "react";
import { getTodayKey } from "../hooks/useDailyState";

export default function TarotCard({ tarotData }) {
  const todayKey = getTodayKey();

  // 🧠 generate daily spread
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
  const [showSummary, setShowSummary] = useState(false);

  const labels = ["Past", "Present", "Future"];

  const flipCard = (index) => {
    const updated = [...flipped];
    updated[index] = true;
    setFlipped(updated);
  };

  // ✨ when all flipped → show summary
  useEffect(() => {
    if (flipped.every((f) => f === true)) {
      setTimeout(() => setShowSummary(true), 600);
    }
  }, [flipped]);

  // 🔮 simple “AI-style” summary generator
  const generateSummary = () => {
    return `
Your past was influenced by ${spread[0].name.replace(
      /[^a-zA-Z ]/g,
      "",
    )}, suggesting ${spread[0].meaning.replace("💬", "")}.

In the present, ${spread[1].name.replace(
      /[^a-zA-Z ]/g,
      "",
    )} shows that ${spread[1].meaning.replace("💬", "")}.

Looking ahead, ${spread[2].name.replace(
      /[^a-zA-Z ]/g,
      "",
    )} indicates ${spread[2].meaning.replace("💬", "")}.

Take this reading as guidance—your path is still yours to shape ✨
    `;
  };

  return (
    <div className="flex flex-col items-center gap-6 px-4">
      <h2 className="text-[20px] text-gray-700">🔮 Your Daily Reading</h2>

      {/* 🃏 Cards */}
      <div className="flex gap-4">
        {spread.map((card, i) => (
          <div
            key={i}
            className="w-28 h-44 perspective cursor-pointer"
            onClick={() => flipCard(i)}
          >
            <div
              className={`relative w-full h-full transition-transform duration-700 ${
                flipped[i] ? "rotate-y-180" : ""
              }`}
              style={{ transformStyle: "preserve-3d" }}
            >
              {/* FRONT */}
              <div className="absolute w-full h-full backface-hidden pixel-card-soft flex items-center justify-center rounded-md">
                <p className="text-[12px] text-gray-600 text-center">
                  {labels[i]} <br /> Tap
                </p>
              </div>

              {/* BACK */}
              <div className="absolute w-full h-full rotate-y-180 backface-hidden pixel-card-soft flex flex-col items-center justify-center p-2 rounded-md text-center">
                <div
                  className="w-full h-20 bg-cover bg-center rounded mb-2"
                  style={{ backgroundImage: `url(${card.image})` }}
                />

                <p className="text-[12px] text-gray-700">{card.name}</p>

                <p className="text-[10px] text-gray-600">{card.meaning}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ✨ Summary */}
      {showSummary && (
        <div className="pixel-card-soft p-4 rounded-md text-center animate-fadeIn max-w-xs">
          <p className="text-[11px] text-gray-700 whitespace-pre-line">
            {generateSummary()}
          </p>
        </div>
      )}
    </div>
  );
}
