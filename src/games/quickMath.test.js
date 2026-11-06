import test from 'node:test';
import assert from 'node:assert/strict';
import { makeQuestion, gameReducer, initialGame, MAX_HEARTS, QUESTION_MS, pickQuestion, buildQuestion, speedBonus } from './quickMath.js';
import { factGrid, factKey, factStatus, recordFact, sanitizeFacts } from './facts.js';

test('all levels generate valid integer arithmetic without answer choices', () => {
  for (const level of [1, 2, 5, 20, 100]) {
    for (let operation = 0; operation < 4; operation++) {
      for (let i = 0; i < 100; i++) {
        const q = makeQuestion(level, operation);
        const expected = [q.a + q.b, q.a - q.b, q.a * q.b, q.a / q.b][operation];
        assert.equal(q.answer, expected);
        assert.ok(Number.isInteger(q.answer) && q.answer >= 0);
        assert.equal(q.options, undefined);
        assert.ok(q.b > 0);
      }
    }
  }
});

const start = () => gameReducer(initialGame(), { type: 'start', now: 1000 });
const answer = (state, now = 2000) => gameReducer(state, { type: 'answer', value: state.question.answer, now });

test('scores once per question, resets timer, levels every three and cycles all operations', () => {
  let state = start();
  const operations = new Set();
  for (let i = 0; i < 5; i++) {
    const now = 2000 + i * 1000;
    operations.add(state.operation);
    state = answer(state, now);
    const duplicate = answer(state, now);
    assert.equal(duplicate.score, state.score);
    assert.equal(duplicate.correct, state.correct);
    assert.ok(state.remaining <= QUESTION_MS);
    state = gameReducer(state, { type: 'next', now: now + 1 });
    assert.equal(state.remaining, QUESTION_MS);
    assert.equal(state.deadline, now + 1 + QUESTION_MS);
    assert.equal(state.questionNumber, i + 2);
  }
  assert.equal(operations.size, 4);
  assert.equal(state.level, 2);
  assert.equal(state.correct, 5);
  // 90 base/streak points plus a +10 lightning bonus for each ~1s answer.
  assert.equal(state.score, 140);
  assert.equal(state.bestStreak, 5);
});

test('incorrect answers preserve score and question, reset streak, and allow retry', () => {
  let state = answer(start());
  state = gameReducer(state, { type: 'next', now: 2001 });
  const wrong = state.question.answer + 123;
  const retry = gameReducer(state, { type: 'answer', value: wrong, now: 2100 });
  assert.equal(retry.score, state.score);
  assert.equal(retry.streak, 0);
  assert.equal(retry.question, state.question);
  assert.equal(retry.feedback.correct, false);
  assert.equal(answer(retry, 2200).correct, 2);
});

test('expiration reveals answer without ending play or awarding late answers', () => {
  const state = start();
  const late = answer(state, state.deadline);
  assert.equal(late.status, 'playing');
  assert.equal(late.feedback.timedOut, true);
  assert.equal(late.score, 0);
  assert.equal(late.remaining, 0);
  assert.equal(late.attempts, 1);
  assert.equal(answer(late, 999999), late);
  assert.equal(gameReducer(late, { type: 'tick', now: 999999 }), late);
  const next = gameReducer(late, { type: 'next', now: 999999 });
  assert.equal(next.remaining, QUESTION_MS);
  assert.equal(next.deadline, 999999 + QUESTION_MS);
  assert.equal(next.feedback, null);
  assert.equal(next.questionNumber, 2);
});

test('correct-answer celebrations cannot time out and endless play exceeds old total limit', () => {
  let state = start();
  for (let i = 0; i < 10; i++) {
    state = answer(state, state.deadline - 1);
    const celebrated = gameReducer(state, { type: 'tick', now: state.deadline + 1000 });
    assert.equal(celebrated, state);
    state = gameReducer(state, { type: 'next', now: state.deadline + 1000 });
  }
  assert.equal(state.status, 'playing');
  assert.equal(state.correct, 10);
  assert.equal(state.level, 4);
  assert.ok(state.deadline > 120000);
});

test('pause freezes time and resume preserves it; restart resets level and score', () => {
  const state = start();
  const paused = gameReducer(state, { type: 'pause', now: 11000 });
  assert.equal(paused.remaining, 20000);
  assert.equal(gameReducer(paused, { type: 'tick', now: 999999 }), paused);
  const resumed = gameReducer(paused, { type: 'resume', now: 500000 });
  assert.equal(resumed.deadline, 520000);
  const restarted = gameReducer(answer(resumed, 500001), { type: 'start', now: 600000 });
  assert.equal(restarted.level, 1);
  assert.equal(restarted.score, 0);
  assert.equal(restarted.remaining, QUESTION_MS);
  assert.equal(restarted.questionNumber, 1);
});

test('only explicit finish ends play, including while paused or showing timeout', () => {
  const state = answer(start());
  for (const candidate of [
    state,
    gameReducer(state, { type: 'pause', now: 2100 }),
    answer(start(), 999999),
  ]) {
    const finished = gameReducer(candidate, { type: 'finish', now: 9999999 });
    assert.equal(finished.status, 'finished');
    assert.equal(finished.score, candidate.score);
    assert.equal(finished.correct, candidate.correct);
  }
});

test('multiplication and division stay in times-table range through level 10', () => {
  for (let level = 1; level <= 10; level++) {
    for (let i = 0; i < 200; i++) {
      const mul = makeQuestion(level, 2);
      assert.ok(mul.a <= 12 && mul.b <= 12);
      const div = makeQuestion(level, 3);
      assert.ok(div.b <= 12 && div.answer <= 12);
    }
  }
  const late = makeQuestion(40, 2);
  assert.ok(late.a <= 25 && late.b <= 25);
});

const wrong = (state, now = 2100) => gameReducer(state, { type: 'answer', value: state.question.answer + 1, now });

test('wrong answers and timeouts cost a heart; losing the last heart ends the game', () => {
  let state = start();
  assert.equal(state.hearts, MAX_HEARTS);
  state = wrong(state);
  assert.equal(state.hearts, 2);
  assert.equal(state.status, 'playing');
  state = gameReducer(state, { type: 'tick', now: state.deadline });
  assert.equal(state.feedback.timedOut, true);
  assert.equal(state.hearts, 1);
  state = gameReducer(state, { type: 'next', now: 50000 });
  state = wrong(state, 50001);
  assert.equal(state.hearts, 0);
  assert.equal(state.status, 'finished');
  assert.equal(state.outOfHearts, true);
  assert.equal(wrong(state, 50002), state);
  const fresh = gameReducer(state, { type: 'start', now: 60000 });
  assert.equal(fresh.hearts, MAX_HEARTS);
  assert.equal(fresh.outOfHearts, false);
});

test('a heart is restored every five levels, never above the maximum', () => {
  let state = wrong(wrong(start()));
  assert.equal(state.hearts, 1);
  let now = 3000;
  const solve = () => {
    state = answer(state, now);
    const result = state;
    state = gameReducer(state, { type: 'next', now: now + 1 });
    now += 10;
    return result;
  };
  while (state.level < 4) solve();
  assert.equal(state.hearts, 1);
  while (state.level < 5) solve();
  assert.equal(state.hearts, 2);
  while (state.level < 9) solve();
  assert.equal(state.hearts, 2);
  const reachedTen = (() => { let r; while (state.level < 10) r = solve(); return r; })();
  assert.equal(reachedTen.feedback.heartEarned, true);
  assert.equal(state.hearts, 3);
  while (state.level < 15) solve();
  assert.equal(state.hearts, MAX_HEARTS);
});

test('speed bonus rewards first-try answers under 2s and 3s only', () => {
  assert.deepEqual(speedBonus(1500), { speed: 'lightning', bonus: 10 });
  assert.deepEqual(speedBonus(2800), { speed: 'fast', bonus: 5 });
  assert.deepEqual(speedBonus(9000), { speed: null, bonus: 0 });
  const slow = answer(start(), 1000 + 9000);
  assert.equal(slow.feedback.ms, 9000);
  assert.equal(slow.feedback.bonus, 0);
  assert.equal(slow.score, 10);
  const retried = answer(wrong(start(), 1100), 1500);
  assert.equal(retried.feedback.bonus, 0);
  assert.equal(retried.fastAnswers, 0);
});

test('facts record first-try time, a single miss per question, and timeouts', () => {
  let state = start();
  const key = factKey(state.operation, state.question);
  state = answer(state, 3500);
  assert.equal(state.facts[key].ms, 2500);
  assert.equal(state.facts[key].lastOk, true);
  assert.equal(factStatus(state.facts[key]), 'fast');

  let missed = start();
  const missedKey = factKey(missed.operation, missed.question);
  missed = wrong(missed, 1100);
  missed = wrong(missed, 1200);
  missed = answer(missed, 1300);
  assert.deepEqual([missed.facts[missedKey].n, missed.facts[missedKey].miss, missed.facts[missedKey].lastOk], [1, 1, false]);

  const timedOut = gameReducer(start(), { type: 'tick', now: 1000 + QUESTION_MS });
  assert.equal(Object.values(timedOut.facts)[0].lastOk, false);

  const kept = gameReducer(missed, { type: 'start', now: 9000 });
  assert.equal(kept.facts, missed.facts);
  assert.deepEqual(gameReducer({ ...kept, status: 'finished' }, { type: 'resetFacts' }).facts, {});
  assert.equal(gameReducer(kept, { type: 'resetFacts' }), kept);
});

test('review questions replay weak facts that fit the current level', () => {
  let facts = recordFact({}, 2, buildQuestion(2, 7, 8), { ok: false, now: 1 });
  facts = recordFact(facts, 2, buildQuestion(2, 3, 3), { ok: true, ms: 1000, now: 2 });
  facts = recordFact(facts, 2, buildQuestion(2, 20, 20), { ok: false, now: 3 });
  const review = pickQuestion(5, 2, facts, null, () => 0);
  assert.deepEqual([review.a, review.b, review.answer, review.review], [7, 8, 56, true]);
  assert.equal(pickQuestion(5, 2, facts, '2:7:8', () => 0).review, undefined);
  assert.equal(pickQuestion(5, 2, facts, null, () => 0.99).review, undefined);
});

test('fact storage is validated and heat-map cells fold commutative facts', () => {
  const clean = sanitizeFacts({
    '2:7:8': { n: 2, miss: 0, ms: 1800, lastOk: true, t: 5 },
    '2:8:7': { n: 1, miss: 1, ms: null, lastOk: false, t: 6 },
    '1:3:9': { n: 1, miss: 0, ms: 100, lastOk: true, t: 1 },
    '3:7:2': { n: 1, miss: 0, ms: 100, lastOk: true, t: 1 },
    junk: { n: 1 },
    '0:1:1': { n: 1, miss: 2, ms: 1, lastOk: true, t: 1 },
  });
  assert.deepEqual(Object.keys(clean), ['2:7:8', '2:8:7']);
  assert.deepEqual(sanitizeFacts('nope'), {});
  const cell = factGrid(clean, 2).get('7:8');
  assert.deepEqual([cell.n, cell.miss, cell.lastOk], [3, 1, false]);
  assert.equal(factStatus(cell), 'miss');
});
