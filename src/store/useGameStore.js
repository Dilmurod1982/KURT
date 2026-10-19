import { create } from "zustand";
import {
  dealFirstFive,
  findTwoOfClubs,
  trickWinner,
  nextPlayer,
  isLegalPlay,
  sortHand,
  buildDealOrder,
  TEAM,
  PLAYER_NAMES,
  LEFT,
  RIGHT,
} from "../game/engine";
import { chooseCard } from "../game/ai";
import { aiDecideTrump, aiPickCardToOpen } from "../game/trump";

export const useGameStore = create((set, get) => ({
  phase: "lobby",
  roomName: "",
  hands: [[], [], [], []],
  trick: [],
  trickComplete: false,
  leader: 0,
  turn: 0,
  trumpSuit: null,
  trumpCaller: 0,
  trumpChooser: 0,
  firstFive: [],
  pendingDeck: [],
  dealQueue: [],
  lastFourIds: [],
  openedCard: null,
  scores: [0, 0],
  trickCount: [0, 0],
  playedCards: [],
  result: null,
  message: "",
  dealNumber: 1,
  firstDealer: null,
  firstWinnerTeam: null,
  lastDealer: null,
  lastTrumpCaller: null,
  lastLoserTeam: null,

  setPhase: (p) => set({ phase: p }),
  setRoomName: (n) => set({ roomName: n }),

  // ── СТАРТ ИГРЫ ──────────────────────────────────────────
  startGame: (opts = {}) => {
    const {
      trumpCaller = 0,
      dealNumber = 1,
      firstDealer = null,
      firstWinnerTeam = null,
      lastDealer = null,
      lastTrumpCaller = null,
      lastLoserTeam = null,
    } = opts;

    const { firstFive, rest } = dealFirstFive(trumpCaller);
    const hands = [[], [], [], []];
    hands[trumpCaller] = firstFive;

    set({
      hands,
      firstFive,
      pendingDeck: rest,
      dealQueue: [],
      lastFourIds: [],
      trumpChooser: trumpCaller,
      trumpCaller,
      leader: 0,
      turn: 0,
      trick: [],
      trickComplete: false,
      trumpSuit: null,
      openedCard: null,
      scores: [0, 0],
      trickCount: [0, 0],
      playedCards: [],
      phase: "choosingTrump",
      result: null,
      dealNumber,
      firstDealer: firstDealer ?? trumpCaller,
      firstWinnerTeam,
      lastDealer,
      lastTrumpCaller,
      lastLoserTeam,
      message: `${PLAYER_NAMES[trumpCaller]} chooses trump…`,
    });

    if (trumpCaller !== 0) {
      setTimeout(() => {
        const s = get();
        if (s.phase !== "choosingTrump" || s.trumpChooser !== trumpCaller) return;
        const decision = aiDecideTrump(s.firstFive);
        if (decision.mode === "majority") {
          s.applyTrumpMajority(decision.suit, decision.reason);
        } else {
          s.prepareOpenMode();
          setTimeout(() => {
            const s2 = get();
            if (s2.phase !== "openingCard") return;
            const card = aiPickCardToOpen(
              s2.hands[s2.trumpChooser].filter((c) => s2.lastFourIds.includes(c.id))
            );
            if (card) s2.openCard(card.id);
          }, 900);
        }
      }, 1000);
    }
  },

  // ── ВЫБОР КОЗЫРЯ ПО БОЛЬШИНСТВУ ─────────────────────────
  applyTrumpMajority: (suit, reason = "majority") => {
    const { pendingDeck, trumpChooser, firstFive } = get();
    get()._startDealing(pendingDeck, trumpChooser, firstFive, suit, null);
  },

  // ── РЕЖИМ "ОТКРЫТЬ КАРТУ ИЗ ПОСЛЕДНЕЙ РАЗДАЧИ" ─────────
  prepareOpenMode: () => {
    const { pendingDeck, trumpChooser, firstFive } = get();

    // Раздаём всё, НЕ сортируя руку козыревого (важен порядок)
    const hands = [[], [], [], []];
    hands[trumpChooser] = [...firstFive];

    let idx = 0;
    const others = [];
    for (let i = 1; i <= 3; i++) others.push((trumpChooser + i) % 4);
    for (const p of others) {
      for (let c = 0; c < 5; c++) hands[p].push(pendingDeck[idx++]);
    }
    for (let round = 0; round < 2; round++) {
      for (let p = 0; p < 4; p++) {
        for (let c = 0; c < 4; c++) hands[p].push(pendingDeck[idx++]);
      }
    }

    // Последние 4 карты козыревого (индексы 9..12)
    const lastFour = hands[trumpChooser].slice(9, 13);
    const lastFourIds = lastFour.map((c) => c.id);

    set({
      hands,
      phase: "openingCard",
      firstFive: [],
      pendingDeck: [],
      lastFourIds,
      message: `${PLAYER_NAMES[trumpChooser]} opens a card…`,
    });
  },

  // Открыть карту — её масть становится козырем, сразу начинаем играть
  openCard: (cardId) => {
    const { hands, trumpChooser, lastFourIds } = get();
    if (!lastFourIds.includes(cardId)) return;

    const card = hands[trumpChooser].find((c) => c.id === cardId);
    if (!card) return;

    const trumpSuit = card.suit;
    const sortedHands = hands.map((h) => sortHand(h, trumpSuit));

    set({
      hands: sortedHands,
      trumpSuit,
      openedCard: card,
      phase: "playing",
      leader: trumpChooser,
      turn: trumpChooser,
      trick: [],
      trickComplete: false,
      scores: [0, 0],
      trickCount: [0, 0],
      playedCards: [],
      lastFourIds: [],
      message: `Opened ${card.rank}${card.suit}. Trump: ${trumpSuit}. Leader: ${PLAYER_NAMES[trumpChooser]}`,
    });
    get()._scheduleAI();
  },

  // ── АНИМАЦИЯ РАЗДАЧИ ────────────────────────────────────
  _startDealing: (pendingDeck, trumpChooser, firstFive, trumpSuit, openedCard = null) => {
    const initialHands = [[], [], [], []];
    initialHands[trumpChooser] = sortHand(firstFive, trumpSuit);

    const queue = buildDealOrder(pendingDeck, trumpChooser, firstFive);

    set({
      hands: initialHands,
      trumpSuit,
      openedCard,
      phase: "dealing",
      trick: [],
      trickComplete: false,
      scores: [0, 0],
      trickCount: [0, 0],
      playedCards: [],
      dealQueue: queue,
      firstFive: [],
      pendingDeck: [],
      lastFourIds: [],
      message: `Dealing… Trump: ${trumpSuit}`,
    });

    get()._processDealQueue();
  },

  _processDealQueue: () => {
    const { dealQueue, trumpSuit } = get();
    if (!dealQueue || dealQueue.length === 0) {
      const { trumpChooser } = get();
      set({
        phase: "playing",
        dealQueue: [],
        leader: trumpChooser,
        turn: trumpChooser,
        message: `Trump: ${trumpSuit}. Leader: ${PLAYER_NAMES[trumpChooser]}`,
      });
      get()._scheduleAI();
      return;
    }

    const [next, ...remaining] = dealQueue;
    const { hands } = get();
    const newHands = hands.map((h, i) =>
      i === next.player ? sortHand([...h, next.card], trumpSuit) : h
    );
    set({ hands: newHands, dealQueue: remaining });

    setTimeout(() => get()._processDealQueue(), 120);
  },

  // ── ХОД ИГРОКА ──────────────────────────────────────────
  playCard: (cardId) => {
    const { hands, turn, trick, phase, trickComplete } = get();
    if (phase !== "playing" || trickComplete) return;
    const hand = hands[turn];
    const card = hand.find((c) => c.id === cardId);
    if (!card) return;
    const leadSuit = trick.length > 0 ? trick[0].card.suit : null;
    if (!isLegalPlay(hand, card, leadSuit, trick)) {
      set({ message: "Must follow suit!" });
      return;
    }
    get()._applyMove(turn, card);
  },

  _applyMove: (player, card) => {
    const { hands, trick, playedCards } = get();
    const newHands = hands.map((h, i) =>
      i === player ? h.filter((c) => c.id !== card.id) : h
    );
    const newTrick = [...trick, { player, card }];
    const newPlayed = [...playedCards, card.id];

    if (newTrick.length === 4) {
      set({
        hands: newHands,
        trick: newTrick,
        playedCards: newPlayed,
        trickComplete: true,
        message: "",
      });
      return;
    }

    const next = nextPlayer(player);
    set({
      hands: newHands,
      trick: newTrick,
      playedCards: newPlayed,
      turn: next,
    });
    get()._scheduleAI();
  },

  // ── СБОР ВЗЯТКИ ПО КЛИКУ ────────────────────────────────
  collectTrick: () => {
    const { trick, trumpSuit, trickCount, hands, dealNumber } = get();
    if (trick.length !== 4) return;

    const leadSuit = trick[0].card.suit;
    const winner = trickWinner(trick, trumpSuit, leadSuit);
    const team = TEAM[winner];
    const newTrickCount = [...trickCount];
    newTrickCount[team] += 1;
    const newScores = [newTrickCount[0], newTrickCount[1]];

    const cardsLeft = hands[0].length;
    const finished = newTrickCount[0] >= 7 || newTrickCount[1] >= 7 || cardsLeft === 0;

    if (finished) {
      const winnerTeam =
        newTrickCount[0] >= 7 ? 0 :
        newTrickCount[1] >= 7 ? 1 :
        (newTrickCount[0] > newTrickCount[1] ? 0 : 1);
      const loserTeam = 1 - winnerTeam;

      const { trumpCaller, lastDealer } = get();
      const trumpTeam = TEAM[trumpCaller];
      let result = null;

      if (
        winnerTeam === trumpTeam &&
        newTrickCount[winnerTeam] === 7 &&
        newTrickCount[1 - winnerTeam] === 0
      ) result = "KURT";
      else if (
        winnerTeam !== trumpTeam &&
        newTrickCount[winnerTeam] === 7 &&
        newTrickCount[1 - winnerTeam] === 0
      ) result = "KOTYR_KURT";

      set({
        trick: [],
        trickComplete: false,
        trickCount: newTrickCount,
        scores: newScores,
        phase: "finished",
        result,
        firstWinnerTeam: dealNumber === 1 ? winnerTeam : get().firstWinnerTeam,
        lastDealer: lastDealer ?? trumpCaller,
        lastTrumpCaller: trumpCaller,
        lastLoserTeam: loserTeam,
        message: result ? `🏆 ${result}` : `Team ${winnerTeam} wins!`,
      });
      return;
    }

    set({
      trick: [],
      trickComplete: false,
      trickCount: newTrickCount,
      scores: newScores,
      leader: winner,
      turn: winner,
      message: `${PLAYER_NAMES[winner]} takes the trick`,
    });
    get()._scheduleAI();
  },

  _scheduleAI: () => {
    const { turn, phase, trickComplete } = get();
    if (phase !== "playing") return;
    if (trickComplete) return;
    if (turn === 0) return;
    setTimeout(() => {
      const s = get();
      if (s.phase !== "playing" || s.turn !== turn || s.trickComplete) return;
      const card = chooseCard({
        player: turn,
        hand: s.hands[turn],
        trick: s.trick,
        trumpSuit: s.trumpSuit,
        playedCards: new Set(s.playedCards),
      });
      if (card) s._applyMove(turn, card);
    }, 1500);
  },

  // ── СЛЕДУЮЩАЯ РАЗДАЧА ───────────────────────────────────
  nextDeal: () => {
    const {
      dealNumber, firstDealer, firstWinnerTeam,
      lastDealer, lastTrumpCaller, lastLoserTeam,
    } = get();

    let newDealer;
    if (dealNumber === 1 && firstWinnerTeam !== null) {
      const p2 = firstDealer;
      if (firstWinnerTeam === TEAM[p2]) newDealer = LEFT(p2);
      else newDealer = p2;
    } else if (lastLoserTeam !== null) {
      newDealer = (TEAM[lastTrumpCaller] === lastLoserTeam)
        ? lastTrumpCaller
        : (lastTrumpCaller + 2) % 4;
    } else {
      newDealer = lastDealer ?? 0;
    }

    const newTrumpCaller = RIGHT(newDealer);

    get().startGame({
      trumpCaller: newTrumpCaller,
      dealNumber: dealNumber + 1,
      firstDealer,
      firstWinnerTeam,
      lastDealer: newDealer,
      lastTrumpCaller: newTrumpCaller,
      lastLoserTeam: null,
    });
  },

  resetToLobby: () => {
    set({
      phase: "lobby", roomName: "",
      hands: [[], [], [], []], trick: [],
      trickComplete: false,
      leader: 0, turn: 0,
      trumpSuit: null, trumpCaller: 0, trumpChooser: 0,
      firstFive: [], pendingDeck: [], dealQueue: [],
      lastFourIds: [], openedCard: null,
      scores: [0, 0], trickCount: [0, 0], playedCards: [],
      result: null, message: "", dealNumber: 1,
      firstDealer: null, firstWinnerTeam: null,
      lastDealer: null, lastTrumpCaller: null, lastLoserTeam: null,
    });
  },
}));