import { createDeck, shuffle, beats, rankPower, SUITS, RANKS } from "./cards";

// Порядок игроков против часовой стрелки:
// 0 = вы (снизу), 1 = соперник слева, 2 = партнёр (напротив), 3 = соперник справа
// Ход идёт 0 -> 3 -> 2 -> 1 (против часовой)
export const PLAYER_NAMES = ["You", "Left", "Partner", "Right"];
export const TEAM = [0, 1, 0, 1]; // 0 и 2 — одна пара, 1 и 3 — другая

// "слева" по часовой = (p + 3) % 4 — в наших индексах 0→3→2→1 против часовой,
// поэтому по часовой сосед слева от p — это (p + 3) % 4.
// "справа" = (p + 1) % 4.
export const LEFT = (p) => (p + 3) % 4;
export const RIGHT = (p) => (p + 1) % 4;

const RED = ["hearts", "diamonds"];

export function dealInitial() {
  const deck = shuffle(createDeck());
  const hands = [[], [], [], []];
  let idx = 0;
  const rounds = [5, 4, 4];
  for (const count of rounds) {
    for (let c = 0; c < count; c++) {
      for (let p = 0; p < 4; p++) {
        hands[p].push(deck[idx++]);
      }
    }
  }
  return hands;
}

// Раздать 5 карт только козыревому, остальное — в pendingDeck
export function dealFirstFive(trumpCaller) {
  const deck = shuffle(createDeck());
  const firstFive = deck.slice(0, 5);
  const rest = deck.slice(5);
  return { firstFive, rest };
}

/**
 * Дораздать оставшиеся 47 карт.
 * trumpCaller уже имеет 5 карт (firstFive).
 * Остальные получают по 5, затем все по 4 и по 4.
 */
export function dealRest(rest, trumpCaller, firstFive) {
  const hands = [[], [], [], []];
  hands[trumpCaller] = [...firstFive];

  let idx = 0;

  const order = [];
  for (let i = 1; i <= 3; i++) order.push((trumpCaller + i) % 4);
  for (const p of order) {
    for (let c = 0; c < 5; c++) hands[p].push(rest[idx++]);
  }

  for (let round = 0; round < 2; round++) {
    for (let p = 0; p < 4; p++) {
      for (let c = 0; c < 4; c++) hands[p].push(rest[idx++]);
    }
  }

  return hands;
}

export function findTwoOfClubs(hands) {
  for (let p = 0; p < 4; p++) {
    if (hands[p].some((c) => c.suit === "clubs" && c.rank === "2")) return p;
  }
  return 0;
}

export function hasSuit(hand, suit) {
  return hand.some((c) => c.suit === suit);
}

export function trickWinner(trick, trumpSuit, leadSuit) {
  let best = trick[0];
  for (let i = 1; i < trick.length; i++) {
    if (beats(trick[i].card, best.card, trumpSuit, leadSuit)) {
      best = trick[i];
    }
  }
  return best.player;
}

export function isLegalPlay(hand, card, leadSuit, trick) {
  if (!leadSuit) return true;
  if (hasSuit(hand, leadSuit)) {
    return card.suit === leadSuit;
  }
  return true;
}

// Следующий игрок по кругу (против часовой): 0→3→2→1
export function nextPlayer(p) {
  return (p + 3) % 4;
}

// ── Сортировка руки ─────────────────────────────────────
export function sortHand(hand, trumpSuit) {
  const trumps = hand
    .filter((c) => c.suit === trumpSuit)
    .sort((a, b) => rankPower(b.rank) - rankPower(a.rank));

  const rest = hand.filter((c) => c.suit !== trumpSuit);

  const bySuit = {};
  for (const s of SUITS) bySuit[s] = [];
  for (const c of rest) bySuit[c.suit].push(c);
  for (const s of SUITS) {
    bySuit[s].sort((a, b) => rankPower(b.rank) - rankPower(a.rank));
  }

  const trumpIsRed = RED.includes(trumpSuit);
  const nonTrumpSuits = SUITS.filter((s) => s !== trumpSuit);
  const reds = nonTrumpSuits.filter((s) => RED.includes(s));
  const blacks = nonTrumpSuits.filter((s) => !RED.includes(s));

  const order = [];
  let r = 0, b = 0;
  let turnRed = !trumpIsRed; // если козырь красный → начинаем с чёрного
  while (r < reds.length || b < blacks.length) {
    if (turnRed && r < reds.length) order.push(reds[r++]);
    else if (!turnRed && b < blacks.length) order.push(blacks[b++]);
    else if (r < reds.length) order.push(reds[r++]);
    else if (b < blacks.length) order.push(blacks[b++]);
    turnRed = !turnRed;
  }

  const sortedRest = [];
  for (const s of order) sortedRest.push(...bySuit[s]);

  return [...trumps, ...sortedRest];
}

// ── Порядок раздачи для анимации ────────────────────────
export function buildDealOrder(rest, trumpCaller, firstFive) {
  const order = [];
  let idx = 0;

  const others = [];
  for (let i = 1; i <= 3; i++) others.push((trumpCaller + i) % 4);
  for (const p of others) {
    for (let c = 0; c < 5; c++) order.push({ player: p, card: rest[idx++] });
  }

  for (let round = 0; round < 2; round++) {
    for (let p = 0; p < 4; p++) {
      for (let c = 0; c < 4; c++) order.push({ player: p, card: rest[idx++] });
    }
  }

  return order;
}