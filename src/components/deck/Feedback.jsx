import './deck.css';

/*
  Result card shown after an answer.
  status: 'correct' | 'wrong' | 'info'
  Change `key` on the parent to replay the entrance animation.
*/
const ICONS = { correct: '✓', wrong: '↻', info: 'i' };
const TITLES = { correct: 'Correct', wrong: 'Not quite', info: '' };

export default function Feedback({ status = 'info', title, children }) {
  const heading = title ?? TITLES[status];
  return (
    <div className={`feedback ${status}`} role="status">
      <span className="feedback-icon" aria-hidden="true">{ICONS[status]}</span>
      <div className="feedback-body">
        {heading && <strong className="feedback-title">{heading}</strong>}
        <div>{children}</div>
      </div>
    </div>
  );
}
