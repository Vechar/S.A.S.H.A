import { useEffect, useId, useState } from 'react';
import { createPortal } from 'react-dom';
import LessonTitle from '../components/LessonTitle';
import './fractions.css';
import './practice.css';
import { MoonIntro, MoonLightDirection, MoonPhaseLesson, MoonMatchingQuiz, CurrentMoon, LessonEnd, createMoonQuiz, moonPhases } from './MoonLesson';

const pepperoni = [
  [190, 130], [285, 125], [365, 185], [130, 220],
  [240, 210], [315, 270], [165, 320], [260, 365], [375, 340],
];
const basil = [[250, 155, -30], [175, 260, 35], [350, 235, -20], [220, 310, 55], [310, 330, -45]];

function PizzaArtwork() {
  return (
    <>
      <circle cx="250" cy="256" r="224" fill="#080d20" opacity="0.35" />
      <circle cx="250" cy="250" r="220" fill="#bd7139" />
      <circle cx="250" cy="246" r="212" fill="#e7a65a" />
      <circle cx="250" cy="246" r="194" fill="#c64d38" />
      <circle cx="250" cy="246" r="184" fill="#f3cd72" />
      <path d="M110 245 Q135 120 265 100 M285 404 Q395 380 407 275" fill="none" stroke="#ffe3a0" strokeWidth="9" strokeLinecap="round" opacity="0.6" />
      {pepperoni.map(([x, y]) => (
        <g key={`${x}-${y}`}>
          <circle cx={x} cy={y} r="26" fill="#a83c36" />
          <circle cx={x} cy={y - 2} r="23" fill="#d65b48" />
          <circle cx={x - 8} cy={y - 7} r="3" fill="#ed9670" />
          <circle cx={x + 7} cy={y + 6} r="4" fill="#ad4035" />
          <circle cx={x + 9} cy={y - 9} r="2.5" fill="#f3b085" />
        </g>
      ))}
      {basil.map(([x, y, angle]) => (
        <g key={`${x}-${y}`} transform={`translate(${x} ${y}) rotate(${angle})`}>
          <path d="M0 19 Q-28 -5 0 -25 Q28 -5 0 19" fill="#508e53" />
          <path d="M0 15 V-16" stroke="#9ac578" strokeWidth="2.5" strokeLinecap="round" />
        </g>
      ))}
      {[[155, 175], [315, 160], [210, 385], [105, 290], [380, 285], [280, 290]].map(([x, y]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r="5" fill="#e8aa51" />
      ))}
    </>
  );
}

function PizzaWheel({ interactive, onCut, count }) {
  const [cutAngle, setCutAngle] = useState(null);
  const previewAngle = interactive ? cutAngle : null;
  const pointerAngle = (event) => {
    const matrix = event.currentTarget.getScreenCTM();
    if (!matrix) return null;
    const point = new DOMPoint(event.clientX, event.clientY).matrixTransform(matrix.inverse());
    const dx = point.x - 250;
    const dy = point.y - 250;
    return Math.hypot(dx, dy) <= 220 ? Math.atan2(dy, dx) : null;
  };

  return (
    <svg
      className={`pizza-wheel${interactive ? ' pizza-wheel-interactive' : ''}`}
      viewBox="0 0 500 500"
      role={interactive ? 'button' : 'img'}
      tabIndex={interactive ? 0 : undefined}
      aria-label={interactive ? `Cut the pizza into ${count} equal pieces. Hover to choose a cut, then click, or press Enter.` : 'A whole pizza with cheese, pepperoni, and basil'}
      onPointerMove={interactive ? (event) => setCutAngle(pointerAngle(event)) : undefined}
      onClick={interactive ? (event) => {
        const angle = pointerAngle(event);
        if (angle !== null) onCut(angle);
      } : undefined}
      onKeyDown={interactive ? (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onCut(cutAngle ?? Math.PI / 2);
        }
      } : undefined}
      onPointerLeave={() => setCutAngle(null)}
    >
      <PizzaArtwork />
      {previewAngle !== null && (
        <g className="pizza-cut-preview" aria-hidden="true">
          {Array.from({ length: count }, (_, index) => {
            const angle = previewAngle + index * 2 * Math.PI / count;
            return (
              <g key={index}>
                <line x1="250" y1="250" x2={250 + 220 * Math.cos(angle)} y2={250 + 220 * Math.sin(angle)} stroke="#171d35" strokeWidth="9" strokeLinecap="round" />
                <line x1="250" y1="250" x2={250 + 220 * Math.cos(angle)} y2={250 + 220 * Math.sin(angle)} stroke="#ffffff" strokeWidth="4" strokeDasharray="10 9" strokeLinecap="round" />
              </g>
            );
          })}
        </g>
      )}
    </svg>
  );
}

function PersonBust({ shirt, skin, hair, girl = false }) {
  return (
    <svg className="person-bust" viewBox="0 0 160 200" aria-hidden="true">
      <path d="M12 194 V167 Q12 126 80 126 Q148 126 148 167 V194 Z" fill={shirt} />
      <path d="M64 113 V137 Q80 154 96 137 V113" fill={skin} />
      {girl
        ? <path d="M37 73 Q31 17 80 17 Q129 17 123 73 L132 137 Q108 150 98 127 H60 Q42 147 28 134 Z" fill={hair} />
        : <path d="M38 81 L36 49 L47 39 L45 25 L65 29 L79 14 L91 25 L112 23 L111 36 Q128 46 122 81 Z" fill={hair} />}
      <ellipse cx="80" cy="82" rx="35" ry="43" fill={skin} />
      <path d="M44 70 Q37 20 80 21 Q125 21 117 67 Q90 59 76 41 Q67 64 44 70" fill={hair} />
      {girl && <path d="M107 48 L122 39 L123 54 L111 58 Z" fill="var(--fun-pink)" />}
      <circle cx="67" cy="82" r="3" fill="#242338" />
      <circle cx="94" cy="82" r="3" fill="#242338" />
      <path d="M70 101 Q80 110 91 101" fill="none" stroke="#925448" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

function ChalkNote({ numerator, naming = false }) {
  return (
    <span className={`chalk-note${numerator ? ' chalk-note-numerator' : ' chalk-note-denominator'}${naming ? ' chalk-note-naming' : ''}`}>
      <svg className="chalk-arrow" viewBox="0 0 120 60" aria-hidden="true">
        <path d={numerator ? 'M114 8 Q48 0 8 49 M8 49 L13 27 M8 49 L31 46' : 'M114 51 Q60 62 8 10 M8 10 L30 14 M8 10 L13 32'} />
        <path className="chalk-arrow-echo" d={numerator ? 'M112 11 Q48 3 10 51' : 'M112 54 Q60 65 10 12'} />
      </svg>
      <svg className="chalk-arrow-mobile" viewBox="0 0 90 120" preserveAspectRatio="none" aria-hidden="true">
        <path d="M12 113 Q85 87 64 7 M64 7 L52 27 M64 7 L81 22" />
      </svg>
      {naming ? (numerator ? 'Numerator' : 'Denominator') : numerator
        ? <>How many of those <mark>pieces</mark> you have</>
        : <>How many equal <mark>pieces</mark> the <mark>whole</mark> pizza is divided into</>}
    </span>
  );
}

function PizzaSlice({ angle, index, count, featured = false, action }) {
  const clipId = useId();
  const explaining = featured && action >= 7;
  const side = index === 0 ? 'left' : 'right';
  const rotation = count === 2 ? angle * 180 / Math.PI - 90 : (angle + index * 2 * Math.PI / count) * 180 / Math.PI;
  const start = angle + index * 2 * Math.PI / count;
  const end = start + 2 * Math.PI / count;
  const wedge = `M250 250 L${250 + 240 * Math.cos(start)} ${250 + 240 * Math.sin(start)} A240 240 0 0 1 ${250 + 240 * Math.cos(end)} ${250 + 240 * Math.sin(end)} Z`;
  const outline = (from, to) => `M250 250 L${250 + 220 * Math.cos(from)} ${250 + 220 * Math.sin(from)} A220 220 0 0 1 ${250 + 220 * Math.cos(to)} ${250 + 220 * Math.sin(to)} Z`;
  return (
    <div className={`pizza-share pizza-share-${side}${count > 2 ? ' pizza-share-sector' : ''}${featured ? ' pizza-share-featured' : ''}`} style={{
      '--cut-rotation': `${count === 2 ? -rotation : -rotation - 90 - 180 / count}deg`,
      ...(count > 2 ? { '--share-x': `calc(50% + ${index - (count - 1) / 2} * var(--person-offset))` } : {}),
    }}>
      {!featured && <svg className="pizza-plate" viewBox="0 0 500 500" aria-hidden="true">
        <circle cx="250" cy="258" r="238" fill="#080d20" opacity="0.25" />
        <circle cx="250" cy="250" r="238" fill="#fdfdff" />
        <circle cx="250" cy="250" r="209" fill="#f0f1f5" stroke="#d9dde6" strokeWidth="3" />
      </svg>}
      <svg className="pizza-half" viewBox="0 0 500 500" role="img" aria-label={explaining ? 'A whole pizza divided into four equal pieces, with one quarter highlighted as yours' : `One ${count === 2 ? 'half' : count === 3 ? 'third' : 'quarter'} of the pizza`}>
        <defs>
          <clipPath id={clipId}>
            {count === 2
              ? <rect x={side === 'left' ? -250 : 250} y="-250" width="500" height="1000" transform={`rotate(${rotation} 250 250)`} />
              : <path d={wedge} />}
          </clipPath>
          {explaining && [1, 2, 3].map((piece) => {
            const from = angle + piece * Math.PI / 2;
            const to = from + Math.PI / 2;
            return (
              <clipPath key={piece} id={`${clipId}-${piece}`}>
                <path d={`M250 250 L${250 + 240 * Math.cos(from)} ${250 + 240 * Math.sin(from)} A240 240 0 0 1 ${250 + 240 * Math.cos(to)} ${250 + 240 * Math.sin(to)} Z`} />
              </clipPath>
            );
          })}
        </defs>
        <g className="pizza-half-turn">
          {explaining && [1, 2, 3].map((piece) => (
            <g key={piece} className={`pizza-slice-interactive pizza-remainder${action >= 8 ? ' pizza-remainder-faint' : ''}`} clipPath={`url(#${clipId}-${piece})`} tabIndex={0} role="img" aria-label={`Quarter ${piece + 1} of the whole pizza`}>
              <g className="pizza-slice-art"><PizzaArtwork /></g>
              <circle className="pizza-slice-hit" cx="250" cy="250" r="220" />
              <path className="pizza-slice-outline" d={outline(angle + piece * Math.PI / 2, angle + (piece + 1) * Math.PI / 2)} />
            </g>
          ))}
          <g className={`pizza-slice-interactive pizza-owned${featured && action >= 8 ? ' pizza-owned-emphasis' : ''}`} clipPath={`url(#${clipId})`} tabIndex={0} role="img" aria-label={`Your ${count === 2 ? 'half' : count === 3 ? 'third' : 'quarter'} of the pizza`}>
            <PizzaArtwork />
            <circle className="pizza-slice-hit" cx="250" cy="250" r="220" />
            <path className="pizza-slice-outline" d={outline(start, end)} />
          </g>
          {explaining && Array.from({ length: 4 }, (_, piece) => {
            const boundary = angle + piece * Math.PI / 2;
            return <line key={piece} x1="250" y1="250" x2={250 + 220 * Math.cos(boundary)} y2={250 + 220 * Math.sin(boundary)} stroke="var(--color-bg)" strokeWidth="4" pointerEvents="none" />;
          })}
        </g>
      </svg>
      <span className="half-fraction" aria-label={count === 2 ? 'one half' : count === 3 ? 'one third' : 'one quarter'}>
        <span className="fraction-number fraction-numerator">
          {featured ? <button type="button" className="fraction-digit" aria-label="Numerator: 1. How many of those pieces you have." title="How many of those pieces you have">1</button> : <span aria-hidden="true">1</span>}
          {featured && action === 8 && <ChalkNote numerator />}
          {featured && action >= 9 && <ChalkNote key="numerator-name" numerator naming />}
        </span>
        <span className="fraction-number fraction-denominator">
          {featured ? <button type="button" className="fraction-digit" aria-label={`Denominator: ${count}. How many equal pieces the whole pizza is divided into.`} title="How many equal pieces the whole pizza is divided into">{count}</button> : <span aria-hidden="true">{count}</span>}
          {explaining && action < 9 && <ChalkNote />}
          {featured && action >= 10 && <ChalkNote key="denominator-name" naming />}
        </span>
      </span>
    </div>
  );
}

function SharingQuestion({ shared, count }) {
  return (
    <>
      {!shared && <h2 className="sharing-question">How do we share one pizza between {count} people?</h2>}
      <div className={`sharing-people${shared ? ' sharing-people-shared' : ''}`} role="img" aria-label={shared ? `${count} children, each with one equal piece of pizza on a white plate` : `${count} children waiting to share the pizza`}>
        <div className="sharing-person"><PersonBust shirt="var(--fun-blue)" skin="#efbc92" hair="#573c36" /></div>
        <div className="sharing-person"><PersonBust girl shirt="var(--fun-purple)" skin="#b97955" hair="#302b36" /></div>
        {count >= 3 && <div className="sharing-person"><PersonBust shirt="var(--fun-teal)" skin="#dba37b" hair="#8b5137" /></div>}
        {count === 4 && <div className="sharing-person"><PersonBust girl shirt="var(--fun-pink)" skin="#f2c9a5" hair="#bc8243" /></div>}
      </div>
    </>
  );
}

function FractionQuestion({ action }) {
  const text = action === 5 ? 'This is a fraction!' : 'But what do these numbers actually mean?';
  return (
    <h2 className="sharing-question fraction-question" key={text}>
      {text}
    </h2>
  );
}

const practiceQuestions = {
  11: { numerator: 1, denominator: 3, question: 'Which number is a Numerator?', correctAnswer: 1 },
  12: { numerator: 2, denominator: 5, question: 'Which number is a Denominator?', correctAnswer: 5 },
  13: { numerator: 4, denominator: 9, question: 'How many slices is the pizza divided into?', correctAnswer: 9 },
  14: { numerator: 4, denominator: 9, question: 'How many slices of pizza do you have?', correctAnswer: 4 },
  15: {
    question: 'What is a fraction?',
    correctAnswer: 2,
    options: [
      <>A fraction is a number that always represents more than one whole.</>,
      <>A fraction is a number that tells you only how many equal pieces a whole is divided into.</>,
      <>A fraction is a number that represents part of a whole or parts of a group.</>,
      <>A fraction is a number that can only describe pieces of a pizza.</>,
    ],
  },
};

function PracticeTime({ action }) {
  const { numerator, denominator, question, correctAnswer, options } = practiceQuestions[action];
  const [answer, setAnswer] = useState(null);
  const [attempt, setAttempt] = useState(0);
  const correct = answer === correctAnswer;

  const choose = (number) => {
    if (correct) return;
    setAnswer(number);
    setAttempt((current) => current + 1);
  };

  return (
    <>
    <div className={`practice-scene${options ? ' practice-definition' : ''}`}>
      <h2 className="practice-question">{question}</h2>
      {options ? (
        <div className="practice-options" role="group" aria-label={question}>
          {options.map((option, index) => (
            <button type="button" className="practice-option" key={index} onClick={() => choose(index)} disabled={correct}>
              <span className="practice-option-letter" aria-hidden="true">{String.fromCharCode(65 + index)}</span>
              <span>{option}</span>
            </button>
          ))}
        </div>
      ) : <div className="practice-fraction" role="group" aria-label={`Choose a number in the fraction ${numerator} over ${denominator}`}>
        <button type="button" className="practice-number practice-numerator" onClick={() => choose(numerator)} disabled={correct} aria-label={`Choose ${numerator}`}>{numerator}</button>
        <span className="practice-fraction-line" aria-hidden="true" />
        <button type="button" className="practice-number practice-denominator" onClick={() => choose(denominator)} disabled={correct} aria-label={`Choose ${denominator}`}>{denominator}</button>
      </div>}
      <PracticeFeedback answered={answer !== null} correct={correct} attempt={attempt} />
    </div>
    </>
  );
}

function PracticeFeedback({ answered, correct, attempt }) {
  return (
    <>
      <div className="practice-feedback-area" aria-live="polite" aria-atomic="true">
        {answered && (
          <div key={attempt} className={`practice-feedback ${correct ? 'practice-correct' : 'practice-incorrect'}`}>
            {correct ? 'Correct!' : 'Incorrect! Try again 😆'}
          </div>
        )}
      </div>
      {answered && correct && createPortal(
        <div className="pizza-rain" aria-hidden="true">
          {Array.from({ length: 16 }, (_, index) => (
            <svg key={index} viewBox="0 0 500 500" style={{
              '--rain-x': `${(index * 37 + 5) % 100}%`,
              '--rain-delay': `${index * 85}ms`,
              '--rain-turn': `${index % 2 ? 300 : -260}deg`,
            }}>
              <PizzaArtwork />
            </svg>
          ))}
        </div>,
        document.body,
      )}
    </>
  );
}

const actions = [
  null, null, SharingQuestion, SharingQuestion, SharingQuestion,
  FractionQuestion, FractionQuestion, FractionQuestion, FractionQuestion, FractionQuestion, FractionQuestion,
  PracticeTime, PracticeTime, PracticeTime, PracticeTime, PracticeTime,
  null, MoonIntro, MoonLightDirection, MoonLightDirection,
  ...moonPhases.map(() => MoonPhaseLesson),
  ...moonPhases.map(() => MoonMatchingQuiz),
  CurrentMoon, LessonEnd,
];

export default function FractionsLesson() {
  const [action, setAction] = useState(0);
  const [cut, setCut] = useState(null);
  const [rolling, setRolling] = useState(false);
  const [moonQuiz] = useState(createMoonQuiz);

  useEffect(() => {
    if (!rolling) return;
    const reveal = window.setTimeout(() => setAction(5), 650);
    const finish = window.setTimeout(() => setRolling(false), 1600);
    return () => {
      window.clearTimeout(reveal);
      window.clearTimeout(finish);
    };
  }, [rolling]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey || event.repeat) return;
      if (event.target instanceof Element && event.target.closest(
        'input, textarea, select, [contenteditable]:not([contenteditable="false"]), [role="slider"], [role="spinbutton"]',
      )) return;
      if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;

      event.preventDefault();
      const direction = event.key === 'ArrowRight' ? 1 : -1;
      if (rolling) {
        if (direction === 1) return;
        setRolling(false);
      }
      const next = Math.max(0, Math.min(actions.length - 1, action + direction));
      if (next !== action) {
        if (action === 4 && next === 5 && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
          setRolling(true);
          return;
        }
        if (next < 5) setCut(null);
        setAction(next);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [action, rolling]);

  const Action = actions[action];
  const practice = action >= 11 && action <= 15;
  const ending = action === actions.length - 1;
  const moon = action >= 17 && !ending;
  const everywhere = action === 16;
  const title = ending ? 'The end!' : everywhere ? 'Fractions are EVERYWHERE!' : moon ? 'Moon fractions' : practice ? 'Practice time ;)' : 'Fractions';
  const count = Math.max(2, Math.min(4, action));
  const featured = action >= 5;
  const showSlices = action <= 10 && (featured || (action >= 2 && cut !== null));

  return (
    <section className={`lesson-stage${count === 3 ? ' lesson-stage-thirds' : count === 4 && !featured ? ' lesson-stage-quarters' : ''}${rolling ? ' lesson-stage-rolling' : ''}${action >= 7 && action <= 10 ? ' lesson-stage-explaining' : ''}${practice ? ' lesson-stage-practice' : ''}${moon ? ' lesson-stage-moon' : ''}${everywhere ? ' lesson-stage-everywhere' : ''}${ending ? ' lesson-stage-ending' : ''}`} aria-label="Fractions lesson" data-action={action}>
      <div className={`fractions-title-position${action > 0 && !everywhere ? ' fractions-title-position-top' : ''}`}>
        <LessonTitle text={title} />
      </div>
      {action > 0 && !featured && cut === null && (
        <div className={`pizza-position${action >= 2 ? ' pizza-position-sharing' : ''}`}>
          <div className="pizza-entrance">
            <PizzaWheel key={action} interactive={action >= 2} onCut={setCut} count={count} />
          </div>
        </div>
      )}
      {Action && <Action key={practice || moon || ending ? action : 'concept'} action={action} shared={cut !== null} count={count} Feedback={PracticeFeedback} moonQuiz={moonQuiz} onNext={() => setAction((current) => Math.min(actions.length - 1, current + 1))} />}
      {showSlices && (
        <>
          {Array.from({ length: featured ? 1 : count }, (_, index) => <PizzaSlice key={index} angle={cut ?? Math.PI / 2} index={index} count={count} featured={featured} action={action} />)}
          {!featured && <p className="sr-only" role="status">The pizza is cut into {count} equal pieces. Each person gets {count === 2 ? 'one half' : count === 3 ? 'one third' : 'one quarter'}.</p>}
        </>
      )}
      {rolling && (
        <div className="rolling-pizza" aria-hidden="true">
          <svg viewBox="0 0 500 500"><PizzaArtwork /></svg>
        </div>
      )}
    </section>
  );
}
