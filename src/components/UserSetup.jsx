import { useState } from "react";

export default function UserSetup({ onSave }) {
  const [name, setName] = useState("");

  const handleSubmit = () => {
    if (!name.trim()) return;

    const userData = {
      name,
      createdAt: new Date().toISOString(),
    };

    localStorage.setItem("user", JSON.stringify(userData));
    onSave(userData);
  };

  return (
    <div className="h-screen flex items-center justify-center bg-pink-100 font-pixel">
      <div className="bg-white p-6 border-4 border-black text-center w-80">
        <h1 className="text-xs mb-4">🌸 Welcome!</h1>
        <p className="mb-4 text-[10px]">Enter your name:</p>

        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border-2 border-black px-2 py-1 w-full mb-4 text-xs"
        />

        <button
          onClick={handleSubmit}
          className="border-2 border-black px-3 py-1 text-xs hover:bg-gray-200"
        >
          Start
        </button>
      </div>
    </div>
  );
}
