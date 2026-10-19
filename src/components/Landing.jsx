import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSettingsStore } from "../store/useSettingsStore";
import { useGameStore } from "../store/useGameStore";
import { useAuthStore } from "../store/useAuthStore";
import LoginModal from "./LoginModal";
import CreatePlayer from "./CreatePlayer";
import GameRoom from "./GameRoom";

export default function Landing() {
  const { t } = useTranslation();
  const { theme, toggleTheme, lang, setLang } = useSettingsStore();
  const { phase, setPhase, setRoomName } = useGameStore();
  const { user, profile, loading, init } = useAuthStore();
  const [loginOpen, setLoginOpen] = useState(false);

  useEffect(() => {
    init();
  }, []);

  // Все фазы, в которых показываем игровую комнату / стол
  if (
    phase === "room" ||
    phase === "choosingTrump" ||
    phase === "openingCard" ||
    phase === "dealing" ||
    phase === "playing" ||
    phase === "finished"
  ) {
    return <GameRoom />;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-felt-light dark:bg-felt-dark text-white">
        {t("common.loading")}
      </div>
    );
  }

  if (user && !profile) {
    return <CreatePlayer />;
  }

  const enterRoom = () => {
    const name = "KURT-" + Math.random().toString(36).slice(2, 7).toUpperCase();
    setRoomName(name);
    setPhase("room");
  };

  return (
    <div className="min-h-screen bg-felt-light dark:bg-felt-dark text-white flex flex-col">
      <header className="flex justify-between items-center p-4">
        <h1 className="text-3xl font-display text-gold">Kurt</h1>
        <div className="flex gap-2 items-center">
          <select
            value={lang}
            onChange={(e) => setLang(e.target.value)}
            className="bg-black/30 rounded px-2 py-1 text-sm"
          >
            {["en", "ru", "uz", "fr", "zh", "de", "ja", "hi", "pt"].map((l) => (
              <option key={l} value={l}>
                {l.toUpperCase()}
              </option>
            ))}
          </select>
          <button
            onClick={toggleTheme}
            className="px-3 py-1 rounded bg-black/30"
          >
            {theme === "light" ? "🌙" : "☀️"}
          </button>
          {profile ? (
            <button
              onClick={enterRoom}
              className="px-4 py-2 rounded-lg bg-gold text-black font-semibold"
            >
              {t("landing.play")}
            </button>
          ) : (
            <button
              onClick={() => setLoginOpen(true)}
              className="px-4 py-2 rounded-lg bg-gold text-black font-semibold"
            >
              {t("landing.login")}
            </button>
          )}
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center flex-col gap-6">
        <h2 className="text-5xl font-display text-gold">
          {t("landing.title")}
        </h2>
        {profile ? (
          <p className="text-white/70">
            {t("landing.welcome", { name: profile.username })}
          </p>
        ) : (
          <p className="text-white/70">{t("landing.subtitle")}</p>
        )}
      </main>

      {loginOpen && <LoginModal onClose={() => setLoginOpen(false)} />}
    </div>
  );
}
