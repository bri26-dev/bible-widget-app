import { useEffect, useState } from "react";
import UserSetup from "./components/UserSetup";
import useTheme from "./hooks/useTheme";
import Home from "./pages/Home";

const CURRENT_USER_VERSION = 2; // 🔥 bump this when structure changes

function App() {
  const [user, setUser] = useState(null);
  const { theme } = useTheme();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (!storedUser) return;

    try {
      const parsed = JSON.parse(storedUser);

      // 🔥 VALIDATION + VERSION CHECK
      const isOutdated =
        !parsed.version ||
        parsed.version < CURRENT_USER_VERSION ||
        !parsed.birthday ||
        !parsed.gender;

      if (isOutdated) {
        // ❌ reset old user safely
        localStorage.removeItem("user");
        setUser(null);
        return;
      }

      setUser(parsed);
    } catch (err) {
      // ❌ corrupted data fallback
      localStorage.removeItem("user");
      setUser(null);
    }
  }, []);

  const handleSave = (newUser) => {
    const updatedUser = {
      ...newUser,
      version: CURRENT_USER_VERSION,
    };

    localStorage.setItem("user", JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  if (!user) {
    return <UserSetup onSave={handleSave} />;
  }

  return <Home user={user} />;
}

export default App;
