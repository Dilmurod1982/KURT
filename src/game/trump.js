import { SUITS, rankPower } from "./cards";

export function pickTrumpByMajority(fiveCards) {
  const bySuit = {};
  for (const s of SUITS) bySuit[s] = [];
  for (const c of fiveCards) bySuit[c.suit].push(c);

  const counts = SUITS.map((s) => ({
    suit: s,
    cards: bySuit[s],
    count: bySuit[s].length,
  })).filter((x) => x.count > 0);

  if (counts.length === 0) return null;

  counts.sort((a, b) => b.count - a.count);
  const top = counts[0];
  const tied = counts.filter((c) => c.count === top.count);

  if (tied.length === 1) {
    return { suit: top.suit, reason: "majority" };
  }

  tied.sort((a, b) => {
    const aMax = Math.max(...a.cards.map((c) => rankPower(c.rank)));
    const bMax = Math.max(...b.cards.map((c) => rankPower(c.rank)));
    return bMax - aMax;
  });
  return { suit: tied[0].suit, reason: "highest" };
}

export function isWeakHand(fiveCards) {
  const allSmall = fiveCards.every((c) => rankPower(c.rank) < 6);
  const bySuit = {};
  for (const c of fiveCards) bySuit[c.suit] = (bySuit[c.suit] || 0) + 1;
  const maxCount = Math.max(...Object.values(bySuit));
  return allSmall && maxCount <= 2;
}

export function aiDecideTrump(fiveCards) {
  if (isWeakHand(fiveCards)) {
    return { mode: "open" };
  }
  const picked = pickTrumpByMajority(fiveCards);
  if (!picked) return { mode: "open" };
  return { mode: "majority", suit: picked.suit, reason: picked.reason };
}

export function aiPickCardToOpen(hand13) {
  const sorted = [...hand13].sort((a, b) => rankPower(a.rank) - rankPower(b.rank));
  return sorted[0];
}