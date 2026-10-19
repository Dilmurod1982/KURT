// Масти
export const SUITS = ["clubs", "diamonds", "hearts", "spades"];
// clubs = трефы (козырь в первой игре)

// Ранги от младшей к старшей (индекс = сила)
export const RANKS = ["2","3","4","5","6","7","8","9","10","J","Q","K","A"];

export const SUIT_SYMBOL = {
  clubs: "♣",
  diamonds: "♦",
  hearts: "♥",
  spades: "♠",
};

export const SUIT_COLOR = {
  clubs: "text-black",
  diamonds: "text-red-600",
  hearts: "text-red-600",
  spades: "text-black",
};

// Создание колоды 52 карты
export function createDeck() {
  const deck = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({ suit, rank, id: `${suit}-${rank}` });
    }
  }
  return deck;
}

// Сила карты (2 = 0 ... A = 12)
export function rankPower(rank) {
  return RANKS.indexOf(rank);
}

// Сравнение двух карт с учётом козыря и масти хода
// Возвращает true, если a бьёт b
export function beats(a, b, trumpSuit, leadSuit) {
  const aTrump = a.suit === trumpSuit;
  const bTrump = b.suit === trumpSuit;
  if (aTrump && !bTrump) return true;
  if (!aTrump && bTrump) return false;
  // обе козыри или обе не козыри
  if (a.suit === b.suit) {
    return rankPower(a.rank) > rankPower(b.rank);
  }
  // разные не-козырные масти: масть хода выигрывает
  if (a.suit === leadSuit) return true;
  if (b.suit === leadSuit) return false;
  return false;
}

export function shuffle(deck) {
  const arr = [...deck];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}