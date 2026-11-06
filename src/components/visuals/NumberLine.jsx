import { useRef } from 'react';
import './visuals.css';

/*
  Number line from 0 to `wholes`, with each whole cut into `denominator` steps.
  value: marker position counted in steps (0 … wholes × denominator).
  Drag the marker, click the line, or use the arrow keys.
*/
const X0 = 40;
const X1 = 760;

export default function NumberLine({ denominator, wholes = 1, value, onChange, showLabels = false, highlight, color = 'var(--fun-orange)' }) {
  const svgRef = useRef(null);
  const dragging = useRef(false);
  const total = denominator * wholes;
  const step = (X1 - X0) / total;
  const markerX = X0 + value * step;

  const fromEvent = (e) => {
    const rect = svgRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 800;
    return Math.max(0, Math.min(total, Math.round((x - X0) / step)));
  };

  const down = (e) => {
    if (!onChange) return;
    dragging.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
    onChange(fromEvent(e));
  };
  const move = (e) => {
    if (dragging.current) {
      const v = fromEvent(e);
      if (v !== value) onChange(v);
    }
  };
  const up = () => { dragging.current = false; };
  const key = (e) => {
    if (!onChange) return;
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') { e.preventDefault(); e.stopPropagation(); onChange(Math.min(total, value + 1)); }
    if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') { e.preventDefault(); e.stopPropagation(); onChange(Math.max(0, value - 1)); }
  };

  return (
    <svg
      ref={svgRef}
      className={`number-line ${onChange ? 'interactive' : ''}`}
      viewBox="0 0 800 130"
      onPointerDown={down}
      onPointerMove={move}
      onPointerUp={up}
      onPointerCancel={up}
      onKeyDown={key}
      tabIndex={onChange ? 0 : undefined}
      role="slider"
      aria-valuemin={0}
      aria-valuemax={total}
      aria-valuenow={value}
      aria-valuetext={`${value} out of ${denominator}`}
    >
      <line x1={X0} y1="60" x2={X1} y2="60" className="nl-axis" />
      <line x1={X0} y1="60" x2={markerX} y2="60" className="nl-progress" style={{ stroke: color }} />
      {Array.from({ length: total + 1 }, (_, i) => {
        const x = X0 + i * step;
        const whole = i % denominator === 0;
        return (
          <g key={i}>
            <line x1={x} y1={whole ? 42 : 50} x2={x} y2={whole ? 78 : 70} className={`nl-tick ${whole ? 'whole' : ''} ${highlight === i ? 'hl' : ''}`} />
            {whole && <text x={x} y="112" className="nl-label big">{i / denominator}</text>}
            {!whole && showLabels && <text x={x} y="104" className="nl-label">{i}/{denominator}</text>}
          </g>
        );
      })}
      <g className="nl-marker" style={{ transform: `translateX(${markerX}px)` }}>
        <path d="M 0 40 L -10 22 L 10 22 Z" style={{ fill: color }} />
        <circle cx="0" cy="60" r="11" style={{ fill: color }} />
        <circle cx="0" cy="60" r="4" className="nl-marker-dot" />
      </g>
    </svg>
  );
}
