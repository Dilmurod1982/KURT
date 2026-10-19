import { useTranslation } from "react-i18next";
import { useGameStore } from "../store/useGameStore";
import GameTable from "./GameTable";
import { PLAYER_NAMES } from "../game/engine";

export default function GameRoom() {
  const { t } = useTranslation();
  const { roomName, phase, startGame } = useGameStore();

  // Все игровые фазы — рендерим стол
  if (
    phase === "choosingTrump" ||
    phase === "openingCard" ||
    phase === "playing" ||
    phase === "finished"
  ) {
    return <GameTable />;
  }

  return (
    <div className="min-h-screen bg-felt-light dark:bg-felt-dark text-white p-6">
      <h2 className="text-3xl font-display text-gold mb-4">
        {t("room.title", { name: roomName })}
      </h2>
      <div className="grid grid-cols-2 gap-4 max-w-2xl">
        {PLAYER_NAMES.map((n, i) => (
          <div key={i} className="bg-black/30 rounded-xl p-4">
            <div className="font-semibold">{n}</div>
            <select className="mt-2 bg-black/40 rounded px-2 py-1 text-sm">
              <option>{t("room.computer")}</option>
              <option disabled>{t("room.playerComingSoon")}</option>
            </select>
          </div>
        ))}
      </div>
      <button
        onClick={() => startGame({ trumpCaller: 0 })}
        className="mt-6 px-6 py-3 rounded-xl bg-gold text-black font-bold"
      >
        {t("room.start")}
      </button>
    </div>
  );
}
