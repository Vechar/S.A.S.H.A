import { factKey, FAST_MS, LIGHTNING_MS, pickReviewFact, recordFact } from './facts.js';

export const QUESTION_MS = 30000;
export const CORRECT_PER_LEVEL = 3;
export const MAX_HEARTS = 3;
export const LEVELS_PER_HEART = 5;
export const NEXT_QUESTION_MS = 320;
export const REVIEW_CHANCE = 0.35;
const symbols = ['+', '−', '×', '÷'];

function integer(min, max) {
  return min + Math.floor(Math.random() * (max - min + 1));
}

export function limits(level) {
  return {
    range: Math.min(200, 10 + level * 6),
    // Times-table factors (up to 12) through level 10, then slowly larger.
    factor: level <= 10 ? Math.min(12, 4 + level) : Math.min(25, 12 + Math.floor((level - 10) / 2)),
  };
}

export function buildQuestion(operation, a, b) {
  return { a, b, answer: [a + b, a - b, a * b, a / b][operation], symbol: symbols[operation] };
}

function fits(operation, a, b, { range, factor }) {
  if (operation <= 1) return a <= range && b <= range;
  if (operation === 2) return a <= factor && b <= factor;
  return b <= factor && a / b <= factor;
}

// Sometimes swap in a missed or slow fact the player has seen before, within the current level's limits.
export function pickQuestion(level, operation, facts = {}, previousKey = null, rand = Math.random) {
  if (rand() < REVIEW_CHANCE) {
    const bounds = limits(level);
    const fact = pickReviewFact(facts, operation, (a, b) => fits(operation, a, b, bounds), previousKey, rand);
    if (fact) return { ...buildQuestion(operation, fact.a, fact.b), review: true };
  }
  return makeQuestion(level, operation);
}

export function makeQuestion(level, operation) {
  const { range, factor } = limits(level);
  let a = integer(1, range);
  let b = integer(1, range);
  let answer;
  if (operation === 0) answer = a + b;
  if (operation === 1) {
    [a, b] = [Math.max(a, b), Math.min(a, b)];
    answer = a - b;
  }
  if (operation === 2) {
    a = integer(1, factor);
    b = integer(1, factor);
    answer = a * b;
  }
  if (operation === 3) {
    b = integer(1, factor);
    answer = integer(1, factor);
    a = b * answer;
  }
  return { a, b, answer, symbol: symbols[operation] };
}

function makeInitialGame(facts, questionMs) {
  return {
    status: 'ready', score: 0, correct: 0, attempts: 0, streak: 0,
    bestStreak: 0, level: 1, hearts: MAX_HEARTS, outOfHearts: false, questionNumber: 1, remaining: questionMs, feedback: null,
    facts, missed: false, totalMs: 0, fastAnswers: 0, bestMs: null,
  };
}

export function initialGame(facts = {}) {
  return makeInitialGame(facts, QUESTION_MS);
}

export function speedBonus(ms) {
  if (ms <= LIGHTNING_MS) return { speed: 'lightning', bonus: 10 };
  if (ms <= FAST_MS) return { speed: 'fast', bonus: 5 };
  return { speed: null, bonus: 0 };
}

function recordMiss(state, now) {
  if (state.missed) return state;
  return { ...state, missed: true, facts: recordFact(state.facts, state.operation, state.question, { ok: false, now }) };
}

function loseHeart(state) {
  const hearts = state.hearts - 1;
  return hearts > 0 ? { ...state, hearts } : { ...state, hearts: 0, status: 'finished', outOfHearts: true };
}

export function createGame({ questionMs = QUESTION_MS, pick = pickQuestion, trackFacts = true, bonus = speedBonus } = {}) {
  const initialize = (facts = {}) => makeInitialGame(facts, questionMs);
  const miss = (state, now) => trackFacts ? recordMiss(state, now) : { ...state, missed: true };
  function reducer(state, event) {
    if (event.type === 'start') {
      const operation = integer(0, 3);
      return {
        ...initialize(state.facts), status: 'playing', deadline: event.now + questionMs,
        operation, question: pick(1, operation, state.facts),
      };
    }
    if (event.type === 'resetFacts' && ['ready', 'finished'].includes(state.status)) {
      return { ...state, facts: {} };
    }
    if (event.type === 'resume' && state.status === 'paused') {
      return { ...state, status: 'playing', deadline: event.now + state.remaining };
    }
    if (event.type === 'finish' && ['playing', 'paused'].includes(state.status)) {
      return { ...state, status: 'finished' };
    }
    if (state.status !== 'playing') return state;
    const resolved = state.feedback?.correct || state.feedback?.timedOut;
    if (event.type === 'next' && resolved) {
      const operation = (state.operation + 1) % 4;
      return {
        ...state, operation, questionNumber: state.questionNumber + 1,
        question: pick(state.level, operation, state.facts, trackFacts ? factKey(state.operation, state.question) : null),
        feedback: null, missed: false,
        deadline: event.now + questionMs, remaining: questionMs,
      };
    }
    if (resolved) {
      return event.type === 'pause' ? { ...state, status: 'paused' } : state;
    }
    const remaining = Math.max(0, state.deadline - event.now);
    if (remaining === 0) {
      return loseHeart({
        ...miss(state, event.now), remaining: 0, streak: 0, attempts: state.attempts + 1,
        feedback: { correct: false, timedOut: true, points: 0 },
      });
    }
    if (event.type === 'pause') return { ...state, status: 'paused', remaining };
    if (event.type === 'tick') return { ...state, remaining };
    if (event.type !== 'answer' || !Number.isSafeInteger(event.value) || event.value < 0) return state;
    if (event.value !== state.question.answer) {
      return loseHeart({
        ...miss(state, event.now), attempts: state.attempts + 1, streak: 0,
        feedback: { correct: false, value: event.value, points: 0 },
      });
    }
    const correct = state.correct + 1;
    const streak = state.streak + 1;
    const ms = questionMs - remaining;
    const { speed, bonus: extraPoints } = state.missed ? { speed: null, bonus: 0 } : bonus(ms);
    const points = state.level * 10 + Math.min(streak - 1, 10) * 2 + extraPoints;
    const facts = state.missed || !trackFacts ? state.facts : recordFact(state.facts, state.operation, state.question, { ok: true, ms, now: event.now });
    const level = 1 + Math.floor(correct / CORRECT_PER_LEVEL);
    const heartEarned = level > state.level && level % LEVELS_PER_HEART === 0 && state.hearts < MAX_HEARTS;
    return {
      ...state, correct, attempts: state.attempts + 1, streak,
      bestStreak: Math.max(state.bestStreak, streak), score: state.score + points,
      level, hearts: state.hearts + (heartEarned ? 1 : 0), remaining, facts,
      totalMs: state.totalMs + ms, fastAnswers: state.fastAnswers + (speed ? 1 : 0),
      bestMs: state.bestMs == null ? ms : Math.min(state.bestMs, ms),
      feedback: { correct: true, value: event.value, points, heartEarned, ms, speed, bonus: extraPoints },
    };
  }
  return { initialGame: initialize, gameReducer: reducer };
}

export const gameReducer = createGame().gameReducer;
