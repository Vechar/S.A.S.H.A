import test from 'node:test';
import assert from 'node:assert/strict';
import { makeQuestion, gameReducer, initialGame, QUESTION_MS } from './equations.js';

function substitute(tokens, value) {
  const parts = tokens.slice(0, -2).map((token) => token === 'x' ? value : token);
  let total = parts[0];
  for (let i = 1; i < parts.length; i += 2) {
    const operand = parts[i + 1];
    total = {
      '+': () => total + operand,
      '−': () => total - operand,
      '×': () => total * operand,
      '÷': () => total / operand,
    }[parts[i]]();
  }
  return total;
}

test('all equation tiers have a unique, exact whole-number solution with capped operands', () => {
  for (const level of [1, 2, 3, 4, 5, 10, 100, 10000]) {
    for (let operation = 0; operation < 4; operation++) {
      for (let i = 0; i < 100; i++) {
        const q = makeQuestion(level, operation);
        const rhs = q.tokens.at(-1);
        assert.ok(Number.isSafeInteger(q.answer) && q.answer > 0 && q.answer <= 600);
        assert.equal(q.tokens.filter((token) => token === 'x').length, 1);
        assert.equal(substitute(q.tokens, q.answer), rhs);
        assert.notEqual(substitute(q.tokens, q.answer + 1), rhs);
        assert.notEqual(substitute(q.tokens, q.answer - 1), rhs);
        assert.ok(q.tokens.filter((token) => typeof token === 'number').every((n) => n >= 0 && n <= 650));
        if (level < 3) assert.ok(!q.tokens.includes('×') && !q.tokens.includes('÷'));
        if (level < 5) assert.equal(q.tokens.length, 5);
        if (level >= 5 && operation >= 2) assert.equal(q.tokens.length, 7);
        if (q.tokens.includes('÷')) assert.equal(q.answer % q.tokens[2], 0);
        assert.ok(q.check.includes('='));
      }
    }
  }
});

test('deterministic generation exercises smallest and largest operands', () => {
  for (const rand of [() => 0, () => 0.999999]) {
    for (const level of [1, 3, 5, 100]) {
      for (let operation = 0; operation < 4; operation++) {
        const q = makeQuestion(level, operation, {}, null, rand);
        assert.equal(substitute(q.tokens, q.answer), q.tokens.at(-1));
      }
    }
  }
});

const start = () => gameReducer(initialGame(), { type: 'start', now: 1000 });
const solve = (state, now) => gameReducer(state, { type: 'answer', value: state.question.answer, now });

test('one-minute deadlines survive pause/resume, reject late answers, and reset per question', () => {
  assert.equal(QUESTION_MS, 60000);
  const state = start();
  assert.equal(state.deadline, 61000);
  const paused = gameReducer(state, { type: 'pause', now: 21000 });
  assert.equal(paused.remaining, 40000);
  assert.equal(gameReducer(paused, { type: 'tick', now: 500000 }), paused);
  const resumed = gameReducer(paused, { type: 'resume', now: 500000 });
  assert.equal(resumed.deadline, 540000);
  const timeout = solve(resumed, resumed.deadline);
  assert.equal(timeout.feedback.timedOut, true);
  assert.equal(timeout.hearts, 2);
  assert.equal(timeout.correct, 0);
  assert.equal(gameReducer(timeout, { type: 'tick', now: 600000 }), timeout);
  const next = gameReducer(timeout, { type: 'next', now: 600000 });
  assert.equal(next.remaining, 60000);
  assert.equal(next.deadline, 660000);
});

test('levels unlock all tiers, score once without speed bonuses, and leave facts untouched', () => {
  let state = start();
  const facts = state.facts;
  for (let i = 0; i < 24; i++) {
    const now = state.deadline - 50000;
    state = solve(state, now);
    assert.equal(state.feedback.speed, null);
    assert.equal(state.feedback.bonus, 0);
    assert.equal(state.feedback.ms, 10000);
    assert.equal(state.facts, facts);
    assert.equal(solve(state, now), state);
    state = gameReducer(state, { type: 'next', now: now + 320 });
  }
  assert.equal(state.level, 9);
  assert.equal(state.correct, 24);
  assert.equal(state.fastAnswers, 0);
});

test('wrong answers cost hearts, allow retry, and restore a heart at level five', () => {
  let state = start();
  const question = state.question;
  state = gameReducer(state, { type: 'answer', value: question.answer + 1, now: 2000 });
  assert.equal(state.hearts, 2);
  assert.equal(state.question, question);
  for (let i = 0; i < 12; i++) {
    state = solve(state, state.deadline - 1000);
    if (i < 11) state = gameReducer(state, { type: 'next', now: state.deadline + 320 });
  }
  assert.equal(state.level, 5);
  assert.equal(state.hearts, 3);
  assert.equal(state.feedback.heartEarned, true);
});

test('last heart ends game, finish works while paused, and restart resets progress', () => {
  let state = start();
  for (let i = 0; i < 3; i++) {
    state = gameReducer(state, { type: 'answer', value: state.question.answer + 1, now: 2000 + i });
  }
  assert.equal(state.status, 'finished');
  assert.equal(state.outOfHearts, true);
  assert.equal(state.hearts, 0);
  state = gameReducer(state, { type: 'start', now: 100000 });
  assert.equal(state.hearts, 3);
  assert.equal(state.level, 1);
  assert.equal(state.score, 0);
  state = gameReducer(state, { type: 'pause', now: 101000 });
  state = gameReducer(state, { type: 'finish', now: 102000 });
  assert.equal(state.status, 'finished');
  assert.equal(state.outOfHearts, false);
});
