export const FAST_MS = 3000;
export const LIGHTNING_MS = 2000;
export const SLOW_MS = 5000;
export const MAX_FACTS = 1500;
const KEY_PATTERN = /^([0-3]):(\d{1,4}):(\d{1,4})$/;

export function factKey(operation, question) {
  return `${operation}:${question.a}:${question.b}`;
}

export function parseFactKey(key) {
  const match = KEY_PATTERN.exec(key);
  if (!match) return null;
  const [operation, a, b] = match.slice(1).map(Number);
  if (b < 1 || a < 1) return null;
  if (operation === 1 && a < b) return null;
  if (operation === 3 && a % b !== 0) return null;
  return { operation, a, b };
}

// Average answer time favors recent attempts so improvement shows quickly.
export function recordFact(facts, operation, question, { ok, ms, now }) {
  const key = factKey(operation, question);
  const prev = facts[key] ?? { n: 0, miss: 0, ms: null };
  const next = {
    ...facts,
    [key]: {
      n: prev.n + 1,
      miss: prev.miss + (ok ? 0 : 1),
      ms: ok ? (prev.ms == null ? ms : Math.round(prev.ms * 0.6 + ms * 0.4)) : prev.ms,
      lastOk: ok,
      t: now,
    },
  };
  const keys = Object.keys(next);
  if (keys.length <= MAX_FACTS) return next;
  const oldest = keys.reduce((min, k) => (next[k].t < next[min].t ? k : min), keys[0]);
  delete next[oldest];
  return next;
}

export function factStatus(stat) {
  if (!stat) return 'new';
  if (!stat.lastOk || stat.ms == null) return 'miss';
  if (stat.ms > SLOW_MS) return 'slow';
  if (stat.ms > FAST_MS) return 'ok';
  return 'fast';
}

const reviewWeight = { miss: 4, slow: 3, ok: 1.5 };

export function pickReviewFact(facts, operation, fits, excludeKey, rand = Math.random) {
  const candidates = [];
  let total = 0;
  for (const [key, stat] of Object.entries(facts)) {
    const fact = parseFactKey(key);
    const weight = reviewWeight[factStatus(stat)];
    if (!fact || fact.operation !== operation || !weight || key === excludeKey || !fits(fact.a, fact.b)) continue;
    candidates.push({ fact, weight });
    total += weight;
  }
  let roll = rand() * total;
  for (const { fact, weight } of candidates) {
    roll -= weight;
    if (roll < 0) return fact;
  }
  return null;
}

export function sanitizeFacts(raw) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {};
  const facts = {};
  for (const [key, stat] of Object.entries(raw)) {
    if (!parseFactKey(key) || !stat || typeof stat !== 'object') continue;
    const { n, miss, ms, lastOk, t } = stat;
    if (!Number.isSafeInteger(n) || n < 1 || !Number.isSafeInteger(miss) || miss < 0 || miss > n) continue;
    if (ms !== null && !(Number.isFinite(ms) && ms >= 0)) continue;
    if (typeof lastOk !== 'boolean' || !Number.isFinite(t)) continue;
    facts[key] = { n, miss, ms, lastOk, t };
  }
  return facts;
}

// Heat-map coordinates: + and × fold commutative pairs; − and ÷ use (number taken away / divisor, answer).
export function factCell(operation, a, b) {
  if (operation === 0 || operation === 2) return [Math.min(a, b), Math.max(a, b)];
  if (operation === 1) return [b, a - b];
  return [b, a / b];
}

export function factGrid(facts, operation, size = 12) {
  const cells = new Map();
  for (const [key, stat] of Object.entries(facts)) {
    const fact = parseFactKey(key);
    if (!fact || fact.operation !== operation) continue;
    const [row, col] = factCell(operation, fact.a, fact.b);
    if (row < 1 || col < 1 || row > size || col > size) continue;
    const id = `${row}:${col}`;
    const prev = cells.get(id);
    if (!prev) {
      cells.set(id, { ...stat });
      continue;
    }
    const msValues = [prev.ms, stat.ms].filter((value) => value != null);
    cells.set(id, {
      n: prev.n + stat.n,
      miss: prev.miss + stat.miss,
      ms: msValues.length ? Math.round(msValues.reduce((sum, value) => sum + value, 0) / msValues.length) : null,
      lastOk: prev.lastOk && stat.lastOk,
      t: Math.max(prev.t, stat.t),
    });
  }
  return cells;
}
