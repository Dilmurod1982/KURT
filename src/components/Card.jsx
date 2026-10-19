import { SUIT_SYMBOL, SUIT_COLOR } from "../game/cards";

export default function Card({ card, onClick, selectable, small }) {
  if (!card) {
    return <div className={`card-back ${small ? "w-10 h-14" : "w-16 h-24"}`} />;
  }
  const color = SUIT_COLOR[card.suit];
  return (
    <button
      onClick={onClick}
      disabled={!selectable}
      className={`
        ${small ? "w-10 h-14 text-xs" : "w-16 h-24 text-base"}
        bg-white rounded-lg shadow-card flex flex-col justify-between p-1
        ${color} font-bold border border-gray-300
        ${
          selectable
            ? "hover:-translate-y-2 hover:ring-2 ring-gold transition"
            : ""
        }
      `}
    >
      <span className="self-start leading-none">{card.rank}</span>
      <span className="self-center text-2xl">{SUIT_SYMBOL[card.suit]}</span>
      <span className="self-end leading-none rotate-180">{card.rank}</span>
    </button>
  );
}
