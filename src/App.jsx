import { useEffect, useState } from "react";
import UserSetup from "./components/UserSetup";
import useTheme from "./hooks/useTheme";
import Home from "./pages/Home";

function App() {
  const [user, setUser] = useState(null);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const themeClasses = {
    pink: "bg-pink-100 text-pink-700",
    blue: "bg-blue-100 text-blue-700",
    purple: "bg-purple-100 text-purple-700",
  };

  if (!user) {
    return <UserSetup onSave={setUser} />;
  }

  return <Home user={user} />;

  return (
    <div
      className={`h-screen flex flex-col items-center justify-center ${themeClasses[theme]} font-pixel`}
    >
      <h1 className="text-sm mb-6">🌤 Good day, {user.name}!</h1>

      <div className="flex gap-2">
        <button onClick={() => setTheme("pink")} className="px-2 py-1 border">
          🌸
        </button>
        <button onClick={() => setTheme("blue")} className="px-2 py-1 border">
          🌊
        </button>
        <button onClick={() => setTheme("purple")} className="px-2 py-1 border">
          🍇
        </button>
      </div>
    </div>
  );
}

export default App;
