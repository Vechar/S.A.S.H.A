import { createGame } from './quickMath.js';

export const QUESTION_MS = 60000;

const integer = (min, max, rand) => min + Math.floor(rand() * (max - min + 1));

export function makeQuestion(level, operation, _facts, _previousKey, rand = Math.random) {
  const range = Math.min(50, 5 + level * 2);
  const answer = integer(1, range, rand);
  const b = integer(1, range, rand);
  const factor = integer(2, Math.min(12, 3 + Math.floor(level / 2)), rand);
  const twoStep = level >= 5;
  let tokens;
  let check;
  let label;
  if (level < 3 || operation < 2) {
    const subtract = operation % 2 === 1;
    // Keep early subtraction equations non-negative on both sides.
    const offset = subtract ? Math.min(answer, b) : b;
    const rhs = subtract ? answer - offset : answer + offset;
    tokens = ['x', subtract ? '−' : '+', offset, '=', rhs];
    check = `${answer} ${subtract ? '−' : '+'} ${offset} = ${rhs}`;
    label = subtract ? 'Undo subtraction' : 'Undo addition';
  } else if (operation === 2) {
    const result = factor * answer + (twoStep ? b : 0);
    tokens = twoStep ? [factor, '×', 'x', '+', b, '=', result] : [factor, '×', 'x', '=', result];
    check = `${factor} × ${answer}${twoStep ? ` + ${b}` : ''} = ${result}`;
    label = twoStep ? 'Two steps: subtract, then divide' : 'Undo multiplication';
  } else {
    // Build division from an integer quotient, never a rounded answer.
    const quotient = integer(1, Math.min(12, range), rand);
    const solution = quotient * factor;
    const rhs = quotient + (twoStep ? b : 0);
    tokens = twoStep ? ['x', '÷', factor, '+', b, '=', rhs] : ['x', '÷', factor, '=', quotient];
    check = `${solution} ÷ ${factor}${twoStep ? ` + ${b}` : ''} = ${rhs}`;
    label = twoStep ? 'Two steps: subtract, then multiply' : 'Undo division';
    return { tokens, answer: solution, check, label };
  }
  return { tokens, answer, check, label };
}

export const { initialGame, gameReducer } = createGame({
  questionMs: QUESTION_MS,
  pick: makeQuestion,
  trackFacts: false,
  bonus: () => ({ speed: null, bonus: 0 }),
});
