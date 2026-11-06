import './visuals.css';

/*
  A circle split into `parts` equal sectors.
  filled: bool[] (which sectors are colored)   onToggle(i): makes sectors clickable
  color / sliceColors: fill color(s) for colored sectors
*/
const C = 110;
const R = 100;

export function sectorPath(start, end, r = R, cx = C, cy = C) {
  if (end - start >= 0.9999) {
    return `M ${cx - r} ${cy} A ${r} ${r} 0 1 1 ${cx + r} ${cy} A ${r} ${r} 0 1 1 ${cx - r} ${cy} Z`;
  }
  const a0 = start * Math.PI * 2 - Math.PI / 2;
  const a1 = end * Math.PI * 2 - Math.PI / 2;
  const large = end - start > 0.5 ? 1 : 0;
  return `M ${cx} ${cy} L ${cx + r * Math.cos(a0)} ${cy + r * Math.sin(a0)} A ${r} ${r} 0 ${large} 1 ${cx + r * Math.cos(a1)} ${cy + r * Math.sin(a1)} Z`;
}

export default function FractionCircle({ parts, filled = [], onToggle, color = 'var(--fun-orange)', sliceColors, size = 240 }) {
  const interactive = Boolean(onToggle);
  return (
    <svg
      className={`fraction-circle ${interactive ? 'interactive' : ''}`}
      viewBox="0 0 220 220"
      width={size}
      height={size}
      role="img"
      aria-label={`Circle split into ${parts} equal parts, ${filled.filter(Boolean).length} colored`}
    >
      {Array.from({ length: parts }, (_, i) => {
        const on = Boolean(filled[i]);
        return (
          <path
            key={`${parts}-${i}`}
            d={sectorPath(i / parts, (i + 1) / parts)}
            className={`sector ${on ? 'on' : ''}`}
            style={{ fill: on ? (sliceColors?.[i] ?? color) : undefined }}
            onClick={interactive ? () => onToggle(i) : undefined}
            tabIndex={interactive ? 0 : undefined}
            role={interactive ? 'button' : undefined}
            aria-pressed={interactive ? on : undefined}
            onKeyDown={interactive ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onToggle(i); }
            } : undefined}
          />
        );
      })}
    </svg>
  );
}
