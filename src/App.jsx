import { useEffect } from "react";
import { useSettingsStore } from "./store/useSettingsStore";
import Landing from "./components/Landing";

export default function App() {
  const { theme } = useSettingsStore();

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  return <Landing />;
}
