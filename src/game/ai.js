import { hasSuit, trickWinner, TEAM } from "./engine";
import { rankPower, SUITS } from "./cards";

/**
 * ИИ выбирает карту.
 * @param {object} params
 *  - player: индекс игрока (1, 2 или 3)
 *  - hand: его карты
 *  - trick: текущая взятка [{player, card}]
 *  - trumpSuit
 *  - playedCards: Set всех уже сыгранных карт (id) — для подсчёта
 *  - allCardsCount: сколько карт осталось у каждого (не обязательно)
 * @returns {card}
 */
export function chooseCard({ player, hand, trick, trumpSuit, playedCards }) {
  const leadSuit = trick.length > 0 ? trick[0].card.suit : null;
  const isFirst = trick.length === 0;

  // Легальные карты
  let legal = hand;
  if (leadSuit && hasSuit(hand, leadSuit)) {
    legal = hand.filter((c) => c.suit === leadSuit);
  }

  if (isFirst) {
    // Первый ход: по возможности туз не козырной масти
    const nonTrumpAces = legal.filter(
      (c) => c.rank === "A" && c.suit !== trumpSuit
    );
    if (nonTrumpAces.length > 0) return nonTrumpAces[0];

    // Иначе — самая короткая не козырная масть с младшей картой
    const suitCounts = {};
    for (const c of hand) {
      if (c.suit === trumpSuit) continue;
      suitCounts[c.suit] = (suitCounts[c.suit] || 0) + 1;
    }
    const sortedSuits = Object.keys(suitCounts).sort(
      (a, b) => suitCounts[a] - suitCounts[b]
    );
    for (const s of sortedSuits) {
      const cards = legal.filter((c) => c.suit === s);
      if (cards.length > 0) {
        cards.sort((a, b) => rankPower(a.rank) - rankPower(b.rank));
        return cards[0];
      }
    }
    // Если только козыри
    return legal[0];
  }

  // Не первый ход: есть ли партнёр в взятке и выигрывает ли он
  const partnerSeat = (player + 2) % 4;
  const partnerInTrick = trick.find((t) => t.player === partnerSeat);

  if (partnerInTrick) {
    const winner = trickWinner(trick, trumpSuit, leadSuit);
    if (TEAM[winner] === TEAM[player]) {
      // Партнёр выигрывает — сбрасываем самую младшую не козырную
      const nonTrump = legal.filter((c) => c.suit !== trumpSuit);
      const pool = nonTrump.length > 0 ? nonTrump : legal;
      pool.sort((a, b) => rankPower(a.rank) - rankPower(b.rank));
      return pool[0];
    }
  }

  // Нужно побить. Пробуем побить старшей картой масти хода или козырем
  const currentWinner = trickWinner(trick, trumpSuit, leadSuit);
  const currentBestCard = trick.find((t) => t.player === currentWinner).card;

  // Кандидаты, которые бьют текущего лидера
  const beating = legal.filter((c) => {
    // временно добавим карту в взятку и проверим
    const testTrick = [...trick, { player, card: c }];
    return trickWinner(testTrick, trumpSuit, leadSuit) === player;
  });

  if (beating.length > 0) {
    // Бьём самой младшей из бьющих (экономим старшие)
    beating.sort((a, b) => rankPower(a.rank) - rankPower(b.rank));
    // Но если можем побить не козырем — предпочитаем не козырь
    const nonTrumpBeating = beating.filter((c) => c.suit !== trumpSuit);
    if (nonTrumpBeating.length > 0) return nonTrumpBeating[0];
    return beating[0];
  }

  // Не можем побить — сбрасываем младшую не козырную
  const nonTrump = legal.filter((c) => c.suit !== trumpSuit);
  const pool = nonTrump.length > 0 ? nonTrump : legal;
  pool.sort((a, b) => rankPower(a.rank) - rankPower(b.rank));
  return pool[0];
}