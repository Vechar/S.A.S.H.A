import './visuals.css';

/*
  A bar split into `parts` equal pieces.
  filled: bool[]   onToggle(i): clickable   color / sliceColors   showLabels: "1/d" in each piece
*/
export default function FractionBar({ parts, filled = [], onToggle, color = 'var(--fun-teal)', sliceColors, height = 56, showLabels = false }) {
  const interactive = Boolean(onToggle);
  const Tag = interactive ? 'button' : 'div';
  return (
    <div
      className={`fraction-bar ${interactive ? 'interactive' : ''}`}
      style={{ height }}
      role={interactive ? 'group' : 'img'}
      aria-label={`Bar split into ${parts} equal parts, ${filled.filter(Boolean).length} colored`}
    >
      {Array.from({ length: parts }, (_, i) => {
        const on = Boolean(filled[i]);
        return (
          <Tag
            key={`${parts}-${i}`}
            className={`bar-piece ${on ? 'on' : ''}`}
            style={on ? { background: sliceColors?.[i] ?? color } : undefined}
            onClick={interactive ? () => onToggle(i) : undefined}
            aria-pressed={interactive ? on : undefined}
            aria-label={interactive ? `Piece ${i + 1}` : undefined}
          >
            {showLabels && <span className="bar-piece-label">1/{parts}</span>}
          </Tag>
        );
      })}
    </div>
  );
}
