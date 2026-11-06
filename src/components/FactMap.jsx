import { useMemo, useState } from 'react';
import { factGrid, factStatus, FAST_MS, SLOW_MS } from '../games/facts';

const SIZE = 12;
const numbers = Array.from({ length: SIZE }, (_, index) => index + 1);
const operations = [
  { name: 'Addition', symbol: '+', axes: 'Each square is a pair of numbers added together.' },
  { name: 'Subtraction', symbol: '−', axes: 'Rows: the number taken away. Columns: the answer.' },
  { name: 'Multiplication', symbol: '×', axes: 'Each square is a pair of numbers multiplied together.' },
  { name: 'Division', symbol: '÷', axes: 'Rows: the number you divide by. Columns: the answer.' },
];
const statusLabels = {
  fast: `Fast (${FAST_MS / 1000}s or less)`,
  ok: `Getting there (${FAST_MS / 1000}–${SLOW_MS / 1000}s)`,
  slow: `Slow (over ${SLOW_MS / 1000}s)`,
  miss: 'Missed last time',
  new: 'Not seen yet',
};

function describe(operation, row, col) {
  if (operation === 0) return `${row} + ${col} = ${row + col}`;
  if (operation === 1) return `${row + col} − ${row} = ${col}`;
  if (operation === 2) return `${row} × ${col} = ${row * col}`;
  return `${row * col} ÷ ${row} = ${col}`;
}

export default function FactMap({ facts, onReset }) {
  const [operation, setOperation] = useState(2);
  const folded = operation === 0 || operation === 2;
  const cells = useMemo(() => factGrid(facts, operation, SIZE), [facts, operation]);
  const cellFor = (row, col) => (folded && row > col ? cells.get(`${col}:${row}`) : cells.get(`${row}:${col}`));

  const counts = { fast: 0, ok: 0, slow: 0, miss: 0, new: 0 };
  for (const row of numbers) {
    for (const col of numbers) {
      if (!folded || row <= col) counts[factStatus(cellFor(row, col))] += 1;
    }
  }
  const total = folded ? (SIZE * (SIZE + 1)) / 2 : SIZE * SIZE;
  const practice = counts.ok + counts.slow + counts.miss;
  const { name, symbol, axes } = operations[operation];

  return (
    <section className="qm-fact-map" aria-labelledby="qm-fact-map-title">
      <header className="qm-fact-map-header">
        <div>
          <h2 id="qm-fact-map-title">Fact map</h2>
          <p className="muted">Green means you know it instantly. Missed and slow facts come back more often.</p>
        </div>
        <div className="qm-fact-tabs" role="group" aria-label="Choose operation">
          {operations.map((item, index) => (
            <button key={item.name} type="button" aria-pressed={operation === index} aria-label={item.name}
              className={operation === index ? 'is-active' : ''} onClick={() => setOperation(index)}>{item.symbol}</button>
          ))}
        </div>
      </header>
      <p className="qm-fact-summary">
        <strong>{counts.fast}</strong> of {total} {name.toLowerCase()} facts mastered
        {practice > 0 && <> · <span className="qm-fact-practice">{practice} to practice</span></>}
      </p>
      <div className="qm-fact-scroll">
        <table className="qm-fact-grid">
          <caption className="sr-only">{name} fact map. {axes}</caption>
          <thead>
            <tr><th scope="col" aria-label={name}>{symbol}</th>{numbers.map((n) => <th key={n} scope="col">{n}</th>)}</tr>
          </thead>
          <tbody>
            {numbers.map((row) => (
              <tr key={row}>
                <th scope="row">{row}</th>
                {numbers.map((col) => {
                  const stat = cellFor(row, col);
                  const status = factStatus(stat);
                  const detail = stat
                    ? `${statusLabels[status]}${stat.ms != null ? `, average ${(stat.ms / 1000).toFixed(1)}s` : ''}, ${stat.n - stat.miss} of ${stat.n} correct`
                    : statusLabels.new;
                  const label = `${describe(operation, row, col)}: ${detail}`;
                  return <td key={col} className={`qm-fact is-${status}`} title={label} aria-label={label} />;
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="qm-fact-axes muted">{axes}</p>
      <ul className="qm-fact-legend">
        {Object.entries(statusLabels).map(([status, label]) => (
          <li key={status}><span className={`qm-fact is-${status}`} aria-hidden="true" />{label}</li>
        ))}
      </ul>
      {Object.keys(facts).length > 0 && (
        <button type="button" className="qm-back qm-fact-reset" onClick={() => {
          if (window.confirm('Reset the fact map? This clears all saved answer times and misses.')) onReset();
        }}>Reset fact map</button>
      )}
    </section>
  );
}
