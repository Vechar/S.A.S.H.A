import { useEffect, useReducer, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { CORRECT_PER_LEVEL, gameReducer, initialGame, MAX_HEARTS, NEXT_QUESTION_MS, QUESTION_MS } from '../games/quickMath';
import { sanitizeFacts } from '../games/facts';
import FactMap from '../components/FactMap';
import * as equationGame from '../games/equations';
import './QuickMath.css';

const BEST_KEY = 'sasha.quick-math.best.v1';
const FACTS_KEY = 'sasha.quick-math.facts.v1';
const palettes = [
  ['blue', 'pink', 'yellow', 'purple', 'teal'],
  ['teal', 'orange', 'purple', 'yellow', 'pink'],
  ['pink', 'blue', 'green', 'orange', 'purple'],
  ['yellow', 'purple', 'teal', 'pink', 'blue'],
  ['purple', 'green', 'orange', 'blue', 'yellow'],
];

function loadFacts() {
  try {
    const stored = localStorage.getItem(FACTS_KEY);
    return { facts: stored === null ? {} : sanitizeFacts(JSON.parse(stored)), error: '' };
  } catch {
    return { facts: {}, error: 'Your saved fact map could not be read. A new one will be started.' };
  }
}

const seconds1 = (ms) => `${(ms / 1000).toFixed(1)}s`;
const speedLabels = { lightning: '⚡ Lightning fast!', fast: '🚀 Quick!' };

function loadBest(key) {
  try {
    const stored = localStorage.getItem(key);
    const score = stored === null ? 0 : Number(stored);
    if (!Number.isSafeInteger(score) || score < 0) throw new Error('Invalid saved best score');
    return { score, error: '' };
  } catch {
    return { score: 0, error: 'Your saved best score could not be read. You can still play.' };
  }
}

export default function QuickMath({ equations = false }) {
  const bestKey = equations ? 'sasha.equations.best.v1' : BEST_KEY;
  const questionMs = equations ? equationGame.QUESTION_MS : QUESTION_MS;
  const [factsLoad] = useState(() => equations ? { facts: {}, error: '' } : loadFacts());
  const [game, dispatch] = useReducer(equations ? equationGame.gameReducer : gameReducer, factsLoad.facts, equations ? equationGame.initialGame : initialGame);
  const [factsError, setFactsError] = useState(factsLoad.error);
  const savedFacts = useRef(factsLoad.facts);
  const [best, setBest] = useState(() => loadBest(bestKey));
  const [answer, setAnswer] = useState('');
  const answerInput = useRef(null);
  const send = (type) => dispatch({ type, now: Date.now() });

  useEffect(() => {
    if (game.score <= best.score) return;
    let error = '';
    try {
      localStorage.setItem(bestKey, String(game.score));
    } catch {
      error = 'Best score is saved for this visit only. Browser storage is unavailable.';
    }
    setBest({ score: game.score, error });
  }, [game.score, best.score, bestKey]);

  useEffect(() => {
    if (game.facts === savedFacts.current) return;
    savedFacts.current = game.facts;
    try {
      localStorage.setItem(FACTS_KEY, JSON.stringify(game.facts));
      setFactsError('');
    } catch {
      setFactsError('Fact map progress is saved for this visit only. Browser storage is unavailable.');
    }
  }, [game.facts]);

  useEffect(() => {
    if (game.status !== 'playing') return;
    const timer = game.feedback?.correct || game.feedback?.timedOut ? null
      : setInterval(() => dispatch({ type: 'tick', now: Date.now() }), 200);
    const pauseOnHide = () => {
      if (document.hidden) dispatch({ type: 'pause', now: Date.now() });
    };
    document.addEventListener('visibilitychange', pauseOnHide);
    return () => { clearInterval(timer); document.removeEventListener('visibilitychange', pauseOnHide); };
  }, [game.status, game.feedback]);

  useEffect(() => {
    if (game.status !== 'playing' || !game.feedback?.correct) return;
    const timer = setTimeout(() => dispatch({ type: 'next', now: Date.now() }), NEXT_QUESTION_MS);
    return () => clearTimeout(timer);
  }, [game.status, game.feedback]);

  useEffect(() => { setAnswer(''); }, [game.question]);

  useEffect(() => {
    if (game.status === 'playing') answerInput.current?.focus();
  }, [game.status, game.question]);

  const seconds = Math.ceil(game.remaining / 1000);
  const time = `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
  const active = game.status === 'playing';
  const palette = palettes[(game.questionNumber - 1) % palettes.length];
  const paletteStyle = Object.fromEntries(palette.map((color, index) => [`--qm-color-${index + 1}`, `var(--fun-${color})`]));
  const solution = game.question && (equations ? `x = ${game.question.answer}. Check: ${game.question.check}` : `${game.question.a} ${game.question.symbol} ${game.question.b} = ${game.question.answer}`);
  return (
    <div className={`quick-math${equations ? ' equation-practice' : ''}`} style={paletteStyle}>
      <header className="qm-header">
        <div>
          <Link to="/practice" className="qm-back">← Practice</Link>
          <h1>{equations ? <>Equation <span>Quest</span></> : <>Quick <span>Math</span></>}</h1>
        </div>
        <span className="qm-operation-badge" aria-label="Endless practice">∞ <small>ENDLESS PLAY</small></span>
      </header>
      <div className="qm-stats" aria-label="Game statistics">
        <div><span>Score</span><strong>{game.score}</strong></div>
        <div><span>Best score</span><strong>{best.score}</strong></div>
        <div><span>Level</span><strong>{game.level}</strong></div>
        <div><span>Streak</span><strong>{game.streak}<small> in a row</small></strong></div>
      </div>
      {best.error && <p className="qm-storage-warning" role="alert">{best.error}</p>}
      {factsError && <p className="qm-storage-warning" role="alert">{factsError}</p>}

      <section className={`qm-arena${game.feedback?.correct ? ' qm-arena-success' : ''}`} aria-label={equations ? 'Equation Quest game' : 'Quick Math game'}>
        {game.status === 'ready' && <div className="qm-intro">
          <div className="qm-spark" aria-hidden="true">{equations ? <>x<span>+</span>3 = 7</> : <>42<span>+</span>7</>}</div>
          <h2>{equations ? 'Find x. Keep the balance.' : 'Big colors. Little brain boosts.'}</h2>
          <p>Start at level 1. Find the answer, build a streak, and see how far you can go.</p>
          <ul>
            <li>Endless play. {questionMs / 1000} seconds for every {equations ? 'equation' : 'question'}.</li>
            <li>Level up every 3 correct answers.</li>
            <li>You have 3 hearts. A wrong answer or running out of time costs one. Earn one back every 5 levels.</li>
            {equations ? <>
              <li>Start with addition and subtraction. Unlock multiplication and division at level 3, then two-step equations at level 5.</li>
              <li>Numbers grow as you level up. Take your time: no speed bonuses.</li>
            </> : <>
              <li>Answer fast for bonus points: ⚡ +10 under 2 seconds, 🚀 +5 under 3 seconds.</li>
              <li>Facts you miss or answer slowly come back for review until they’re instant.</li>
            </>}
            <li>{equations ? 'Find the value of x.' : 'All four operations.'} Whole-number answers. Pause whenever you need.</li>
            <li>Type your answer and press Enter or tap Check answer.</li>
            <li>Out of time? See the answer and keep going. Finish whenever you like.</li>
          </ul>
          <button type="button" className="btn btn-primary btn-lg" onClick={() => send('start')}>Let’s play →</button>
        </div>}

        {(active || game.status === 'paused') && <>
          <div className="qm-round-bar">
            <Hearts count={game.hearts} />
            <span className={seconds <= 10 ? 'qm-time qm-time-low' : 'qm-time'} role="timer" aria-label={`${seconds} seconds remaining for this question`}>{time}<small> per question</small></span>
            <button type="button" className="btn btn-ghost" onClick={() => send(active ? 'pause' : 'resume')}>{active ? 'Pause' : 'Resume'}</button>
          </div>
          <progress className="qm-timer-track" value={game.remaining} max={questionMs} aria-label="Time remaining for this question" />
          {game.status === 'paused' ? <div className="qm-paused">
            <h2>A little breather.</h2><p>Your timer is paused. Ready when you are.</p>
            <button type="button" className="btn btn-primary" onClick={() => send('resume')}>Keep playing →</button>
          </div> : <>
            <div className="qm-challenge-header">
              <span className="qm-question-badge">QUESTION {game.questionNumber}</span>
              <span className="qm-operation-name">{equations ? game.question.label : ['Addition', 'Subtraction', 'Multiplication', 'Division'][game.operation]}</span>
              {game.question.review && <span className="qm-review-badge" title="You missed this one or answered it slowly before">🔁 REVIEW</span>}
            </div>
            <div key={game.questionNumber} className={`qm-problem${game.feedback?.correct ? ' qm-win' : ''}`} role="group" aria-label={equations ? `${game.question.tokens.join(' ')}. Find x.` : `${game.question.a} ${game.question.symbol === '−' ? 'minus' : game.question.symbol === '×' ? 'times' : game.question.symbol === '÷' ? 'divided by' : 'plus'} ${game.question.b} equals what?`}>
              {equations ? game.question.tokens.map((token, index) => <span key={index} aria-hidden="true">{token}</span>) : <>
              <span aria-hidden="true">{game.question.a}</span>
              <span aria-hidden="true">{game.question.symbol}</span>
              <span aria-hidden="true">{game.question.b}</span>
              <span aria-hidden="true">=</span>
              <span aria-hidden="true">?</span>
              </>}
            </div>
            <form className="qm-answer-form" onSubmit={(event) => {
              event.preventDefault();
              dispatch({ type: 'answer', value: Number(answer), now: Date.now() });
              answerInput.current?.focus();
              answerInput.current?.select();
            }}>
              <label htmlFor="qm-answer">{equations ? 'x =' : 'Your answer'}</label>
              <div className="qm-answer-row">
                <input ref={answerInput} id="qm-answer" type="text" inputMode="numeric"
                  pattern="[0-9]+" maxLength={15} required autoComplete="off"
                  title="Enter a whole number, using digits only." aria-describedby="qm-answer-help"
                  value={answer} onChange={(event) => setAnswer(event.target.value)}
                  disabled={game.feedback?.correct || game.feedback?.timedOut}
                  className={game.feedback?.correct ? 'qm-input-correct' : ''} />
                <button type="submit" className="btn btn-primary"
                  disabled={!answer || game.feedback?.correct || game.feedback?.timedOut}>Check answer</button>
              </div>
              <p id="qm-answer-help" className="muted">Type a whole number and press Enter.</p>
            </form>
            <div className="qm-feedback" aria-live="polite" aria-atomic="true">
              {game.feedback
                ? <p key={`${game.attempts}`} className={game.feedback.correct ? 'qm-positive' : 'qm-retry'}>
                  {game.feedback.timedOut
                    ? `Time’s up! ${solution}. You lost a heart.`
                    : game.feedback.correct ? <>
                      {game.feedback.speed && <span className={`qm-speed qm-speed-${game.feedback.speed}`}>{speedLabels[game.feedback.speed]} </span>}
                      {`+${game.feedback.points} points in ${seconds1(game.feedback.ms)}${game.feedback.heartEarned ? ' and +1 heart ❤️' : ''}`}
                    </> : 'Not quite. You lost a heart. Try again!'}
                </p>
                : <p className="muted">Take your time. You’ve got this!</p>}
            </div>
            {game.feedback?.timedOut && <button type="button" className="btn btn-primary" onClick={() => send('next')}>Next question →</button>}
            <div className="qm-level-progress">
              <div className="qm-level-dots" aria-hidden="true">
                {Array.from({ length: CORRECT_PER_LEVEL }, (_, index) => <span key={index} className={index < game.correct % CORRECT_PER_LEVEL ? 'is-filled' : ''} />)}
              </div>
              <p className="qm-level-note">{game.correct > 0 && game.correct % CORRECT_PER_LEVEL === 0 && game.feedback?.correct ? `Level up! Welcome to level ${game.level}.` : `${CORRECT_PER_LEVEL - game.correct % CORRECT_PER_LEVEL} correct answers to level ${game.level + 1}`}</p>
            </div>
          </>}
          <div className="qm-footer"><span>Little steps. Big brain energy.</span><button type="button" className="qm-back" onClick={() => send('finish')}>Finish & see results →</button></div>
        </>}

        {game.status === 'finished' && <div className="qm-summary">
          <span className="hero-eyebrow">{game.outOfHearts ? 'OUT OF HEARTS' : 'PRACTICE COMPLETE'}</span>
          {game.outOfHearts && <Hearts count={0} />}
          <h2>{game.score > 0 && game.score >= best.score ? 'A best-score kind of day!' : 'Look at that brain power.'}</h2>
          <p className="qm-final-score">{game.score}<span>points</span></p>
          <div className="qm-results">
            <p><strong>{game.correct}</strong> solved</p>
            <p><strong>{game.bestStreak}</strong> best streak</p>
            <p><strong>{game.attempts ? Math.round(game.correct / game.attempts * 100) : 0}%</strong> accuracy</p>
            <p><strong>{game.correct ? seconds1(game.totalMs / game.correct) : '—'}</strong> average time</p>
            <p><strong>{game.bestMs != null ? seconds1(game.bestMs) : '—'}</strong> fastest</p>
            {!equations && <p><strong>{game.fastAnswers}</strong> speed bonuses</p>}
          </div>
          {game.outOfHearts && <p>Last question: {equations ? `${game.question.tokens.join(' ')}. ` : ''}<strong>{solution}</strong></p>}
          <p>Reached level {game.level}. A new game starts fresh at level 1 with {MAX_HEARTS} hearts.</p>
          <button type="button" className="btn btn-primary btn-lg" onClick={() => send('start')}>Play again →</button>
          <Link to="/practice" className="qm-back">Back to practice</Link>
        </div>}
      </section>
      {!equations && (game.status === 'ready' || game.status === 'finished') && (
        <FactMap facts={game.facts} onReset={() => dispatch({ type: 'resetFacts' })} />
      )}
    </div>
  );
}

function Hearts({ count }) {
  return (
    <span className="qm-hearts" role="img" aria-label={`${count} of ${MAX_HEARTS} hearts left`}>
      {Array.from({ length: MAX_HEARTS }, (_, index) => (
        <span key={`${index}-${index < count}`} className={index < count ? 'qm-heart is-full' : 'qm-heart is-empty'} aria-hidden="true">
          {index < count ? '❤️' : '🤍'}
        </span>
      ))}
    </span>
  );
}
