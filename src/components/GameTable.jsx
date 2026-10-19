import { useTranslation } from "react-i18next";
import { useGameStore } from "../store/useGameStore";
import Card from "./Card";
import { PLAYER_NAMES } from "../game/engine";
import { SUITS, SUIT_SYMBOL } from "../game/cards";

export default function GameTable() {
  const { t } = useTranslation();
  const {
    hands,
    trick,
    turn,
    trumpSuit,
    scores,
    message,
    result,
    playCard,
    phase,
    trumpChooser,
    firstFive,
    openedCard,
    trickComplete,
    lastFourIds,
  } = useGameStore();

  const canPlay = (card) => phase === "playing" && turn === 0 && !trickComplete;

  const chooseTrumpUI = phase === "choosingTrump" && trumpChooser === 0;
  const openCardUI = phase === "openingCard" && trumpChooser === 0;

  return (
    <div className="h-screen overflow-hidden bg-felt-light dark:bg-felt-dark text-white p-2 flex flex-col">
      <header className="flex justify-between items-center mb-1 text-sm">
        <div>
          {t("game.trump")}:{" "}
          <b className="text-gold">
            {trumpSuit ? SUIT_SYMBOL[trumpSuit] : "—"}
          </b>
        </div>
        <div>
          {t("game.score")}:{" "}
          <b className="text-gold">
            {scores[0]} : {scores[1]}
          </b>
        </div>
      </header>

      <div className="flex-1 flex flex-col min-h-0">
        {/* Верх — партнёр */}
        <div className="flex justify-center items-start -space-x-6 h-16">
          {hands[2].map((c) => (
            <Card key={c.id} small />
          ))}
        </div>

        {/* Центр — левый, взятка, правый */}
        <div className="flex-1 flex justify-between items-center min-h-0 px-2">
          <div className="flex flex-col items-center -space-y-10">
            {hands[1].map((c) => (
              <Card key={c.id} small />
            ))}
          </div>

          <div
            className={`relative flex gap-1 items-center justify-center flex-1 min-h-[120px] rounded-xl transition ${
              trickComplete
                ? "cursor-pointer ring-2 ring-gold/60 bg-white/5"
                : ""
            }`}
            onClick={() => {
              if (trickComplete) useGameStore.getState().collectTrick();
            }}
          >
            {trumpSuit && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span className="text-7xl text-white/10 select-none">
                  {SUIT_SYMBOL[trumpSuit]}
                </span>
              </div>
            )}

            {trick.length === 0 && phase === "playing" && (
              <span className="opacity-50 text-sm relative">
                {t("game.waiting")}
              </span>
            )}

            {trick.map((tr, i) => (
              <div
                key={tr.card.id}
                className="flex flex-col items-center relative animate-fly-in"
                style={{ transform: `rotate(${(i - 1.5) * 5}deg)` }}
              >
                <Card card={tr.card} />
                <span className="text-[10px] opacity-70">
                  {PLAYER_NAMES[tr.player]}
                </span>
              </div>
            ))}
          </div>

          <div className="flex flex-col items-center -space-y-10">
            {hands[3].map((c) => (
              <Card key={c.id} small />
            ))}
          </div>
        </div>

        {/* Низ — вы */}
        <div className="flex justify-center items-end -space-x-4 h-28">
          {hands[0].map((c) => (
            <Card
              key={c.id}
              card={c}
              selectable={
                (phase === "playing" && canPlay(c)) ||
                (phase === "openingCard" && trumpChooser === 0)
              }
              onClick={() => {
                if (phase === "playing" && canPlay(c)) playCard(c.id);
                else if (phase === "openingCard" && trumpChooser === 0) {
                  useGameStore.getState().openCard(c.id);
                }
              }}
            />
          ))}
        </div>
      </div>

      <footer className="text-center text-xs mt-1 h-12">
        <div className="opacity-70">{message}</div>
        {trickComplete && (
          <div className="text-gold text-sm animate-pulse">
            {t("game.collectHint")}
          </div>
        )}
        {openedCard && (
          <div className="text-gold text-sm">
            {t("game.opened")}: {openedCard.rank}
            {SUIT_SYMBOL[openedCard.suit]}
          </div>
        )}
        {result && (
          <div className="text-lg text-gold font-display">{result}</div>
        )}
        {phase === "finished" && (
          <button
            onClick={() => useGameStore.getState().nextDeal()}
            className="mt-1 px-4 py-1 rounded bg-gold text-black font-bold"
          >
            {t("game.nextDeal")}
          </button>
        )}
      </footer>

      {/* Модалка выбора козыря */}
      {chooseTrumpUI && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 text-black dark:text-white p-6 rounded-2xl w-[420px]">
            <h3 className="text-xl font-bold mb-4">{t("game.chooseTrump")}</h3>
            <div className="flex gap-2 mb-4">
              {firstFive.map((c) => (
                <Card key={c.id} card={c} small />
              ))}
            </div>
            <p className="text-sm opacity-70 mb-3">
              {t("game.chooseTrumpHint")}
            </p>
            <div className="grid grid-cols-4 gap-2 mb-3">
              {SUITS.map((s) => (
                <button
                  key={s}
                  onClick={() => useGameStore.getState().applyTrumpMajority(s)}
                  className="p-3 rounded bg-black/10 dark:bg-white/10 text-2xl hover:bg-gold hover:text-black transition"
                >
                  {SUIT_SYMBOL[s]}
                </button>
              ))}
            </div>
            <button
              onClick={() => useGameStore.getState().prepareOpenMode()}
              className="w-full py-2 rounded bg-slate-600 text-white font-semibold"
            >
              {t("game.openFromDeal")}
            </button>
          </div>
        </div>
      )}

      {/* Режим открытия карты: последние 4 карты рубашкой вверх */}
      {openCardUI && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 text-black dark:text-white p-6 rounded-2xl w-[520px]">
            <h3 className="text-xl font-bold mb-2">{t("game.openFromDeal")}</h3>
            <p className="text-sm opacity-70 mb-3">
              {t("game.openFromDealHint")}
            </p>
            <div className="flex flex-wrap gap-1 mb-3">
              {hands[trumpChooser].map((c) => {
                const isHidden = lastFourIds.includes(c.id);
                return (
                  <div
                    key={c.id}
                    className={
                      isHidden
                        ? "cursor-pointer hover:-translate-y-1 transition"
                        : ""
                    }
                    onClick={() => {
                      if (isHidden) useGameStore.getState().openCard(c.id);
                    }}
                  >
                    {isHidden ? (
                      <div className="card-back w-10 h-14" />
                    ) : (
                      <Card card={c} small />
                    )}
                  </div>
                );
              })}
            </div>
            <p className="text-xs opacity-50">{t("game.openFromDealNote")}</p>
          </div>
        </div>
      )}
    </div>
  );
}
