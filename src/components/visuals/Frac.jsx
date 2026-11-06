import './visuals.css';

/* Stacked fraction: n over d */
export default function Frac({ n, d, size = 'md', topColor, bottomColor, className = '' }) {
  return (
    <span className={`frac frac-${size} ${className}`} role="math" aria-label={`${n} over ${d}`}>
      <span className="frac-top" style={{ color: topColor }}>{n}</span>
      <span className="frac-line" />
      <span className="frac-bottom" style={{ color: bottomColor }}>{d}</span>
    </span>
  );
}
