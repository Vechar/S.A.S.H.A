import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import LessonTitle from '../components/LessonTitle';
import './equations.css';

function Boxes({ side, extra }) {
  return (
    <g className={`scale-boxes scale-boxes-${side}`}>
      {[0, 1, 2].map((index) => (
        <g className="scale-box-drop" key={index} style={{ '--box-delay': `${index * 140}ms` }}>
          <rect x={-78 + index * 54} y="110" width="48" height="48" rx="6" fill="var(--fun-orange)" />
          <path d={`M${-54 + index * 54} 112V127`} stroke="var(--fun-yellow)" strokeWidth="8" />
          <path d={`M${-71 + index * 54} 150H${-59 + index * 54}`} stroke="var(--color-bg)" strokeWidth="3" strokeLinecap="round" opacity=".3" />
        </g>
      ))}
      {extra && (
        <g className="scale-box-drop" style={{ '--box-delay': '0ms' }}>
          <rect x="-24" y="60" width="48" height="48" rx="6" fill="var(--fun-orange)" />
          <path d="M0 62V77" stroke="var(--fun-yellow)" strokeWidth="8" />
          <path d="M-17 100H-5" stroke="var(--color-bg)" strokeWidth="3" strokeLinecap="round" opacity=".3" />
        </g>
      )}
    </g>
  );
}

function WeightBox({ x = 0, y = 0, big = false }) {
  const size = big ? 64 : 32;
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect width={size} height={size} rx="5" fill={big ? 'var(--fun-purple)' : 'var(--fun-orange)'} />
      <path d={`M${size / 2} 2V${size / 3}`} stroke="var(--fun-yellow)" strokeWidth={big ? 10 : 6} />
    </g>
  );
}

function WeightBoxes({ added, initial = 1 }) {
  return (
    <g className="weight-little-boxes">
      {Array.from({ length: initial }, (_, index) => <WeightBox key={`initial-${index}`} x={-84 + index * 34} y={126} />)}
      {Array.from({ length: added }, (_, index) => (
        <g className="scale-box-drop" key={index} style={{ '--box-delay': `${index * 35}ms` }}>
          <WeightBox x={-84 + ((index + initial) % 5) * 34} y={126 - Math.floor((index + initial) / 5) * 34} />
        </g>
      ))}
    </g>
  );
}

function MysteryWeights({ side, step }) {
  const removed = step >= 2 && step < 4;
  return (
    <g className="mystery-weights">
      {side === 'left' && <g className="mystery-box">
        <rect x="-76" y="94" width="64" height="64" rx="8" fill="var(--fun-purple)" />
        <text x="-44" y="136" textAnchor="middle" fill="var(--color-bg)" fontSize={step >= 3 ? 23 : 36} fontWeight="700">{step >= 3 ? '4 kg' : 'x'}</text>
      </g>}
      {Array.from({ length: side === 'left' ? 2 : 6 }, (_, index) => {
        const selected = side === 'left' || index >= 4;
        const x = side === 'left' ? index * 36 : -70 + (index % 4) * 36;
        const y = side === 'left' ? 126 : 126 - Math.floor(index / 4) * 36;
        return <g key={index} className={`mystery-unit${selected && step === 1 ? ' mystery-unit-selected' : ''}${selected && removed ? ' mystery-unit-removed' : ''}`}>
          <WeightBox x={x} y={y} />
        </g>;
      })}
    </g>
  );
}

function Scale({ action, added = 0 }) {
  const walkthrough = action >= 30;
  const secondChallenge = action === 8;
  const challenge = action === 7 || secondChallenge;
  const tipped = action === 2 || (action === 7 && added + 1 < 4) || (secondChallenge && added + 3 < 8);
  const leftHeavy = action === 6 || (action === 7 && added + 1 > 4) || (secondChallenge && added + 3 > 8);
  const description = walkthrough
    ? action >= 32 && action < 34
      ? 'A balanced scale: the mystery box alone equals four 1 kilogram boxes.'
      : 'A balanced scale: a mystery box and two 1 kilogram boxes equal six 1 kilogram boxes.'
    : secondChallenge
    ? `${added + 3} little boxes on the left, ${added + 3} kilograms. Two big boxes on the right, 8 kilograms. ${tipped ? 'The right pan is lower.' : leftHeavy ? 'The left pan is lower.' : 'The scale is balanced.'}`
    : challenge
    ? `${added + 1} little ${added === 0 ? 'box' : 'boxes'} on the left, ${added + 1} ${added === 0 ? 'kilogram' : 'kilograms'}. One big box on the right, 4 kilograms. ${tipped ? 'The right pan is lower.' : leftHeavy ? 'The left pan is lower.' : 'The scale is balanced.'}`
    : action === 1
    ? 'A large, empty, balanced scale'
    : tipped
      ? 'Three boxes on the right. The right pan tips down.'
      : leftHeavy
        ? 'Four boxes on the left and three on the right. The left pan tips down.'
        : 'Three boxes on each side. The scale is balanced.';

  return (
    <div className={`equation-scale${tipped ? ' equation-scale-tipped' : ''}${leftHeavy ? ' equation-scale-left-heavy' : ''}`}>
      <svg viewBox="0 0 800 510" role="img" aria-label={description}>
        <ellipse cx="400" cy="468" rx="240" ry="18" fill="var(--color-shadow)" />
        <path d="M400 130V438" stroke="var(--fun-blue)" strokeWidth="24" strokeLinecap="round" />
        <path d="M400 379L337 449H463Z" fill="var(--fun-blue)" />
        <rect x="306" y="445" width="188" height="20" rx="10" fill="var(--fun-purple)" />
        <g className="scale-beam">
          <path d="M170 130H630" stroke="var(--fun-purple)" strokeWidth="16" strokeLinecap="round" />
          <circle cx="170" cy="130" r="10" fill="var(--fun-yellow)" />
          <circle cx="630" cy="130" r="10" fill="var(--fun-yellow)" />
        </g>
        {['left', 'right'].map((side) => (
          <g key={side} transform={`translate(${side === 'left' ? 170 : 630} 130)`}>
            <g className={`scale-pan scale-pan-${side}`}>
              <path d="M0 0L-106 160M0 0L106 160" fill="none" stroke="var(--fun-teal)" strokeWidth="5" strokeLinecap="round" />
              {walkthrough ? <MysteryWeights side={side} step={action - 30} /> : challenge
                ? secondChallenge
                  ? side === 'left' ? <WeightBoxes added={added} initial={3} /> : <g className="weight-big-boxes"><WeightBox x={-66} y={94} big /><WeightBox x={2} y={94} big /></g>
                  : side === 'left' ? <WeightBoxes added={added} /> : <WeightBox x={-32} y={94} big />
                : ((side === 'right' && action >= 2) || (side === 'left' && action >= 3)) && <Boxes side={side} extra={side === 'left' && leftHeavy} />}
              <path d="M-112 160H112C105 196 -105 196 -112 160Z" fill="var(--fun-teal)" />
              <path d="M-112 160H112" stroke="var(--color-text)" strokeWidth="5" strokeLinecap="round" opacity=".6" />
            </g>
          </g>
        ))}
        <circle cx="400" cy="130" r="23" fill="var(--fun-yellow)" />
        <circle cx="400" cy="130" r="9" fill="var(--fun-orange)" />
      </svg>
    </div>
  );
}

function MysteryWalkthrough({ action }) {
  const step = action - 30;
  const captions = [
    'The scale is balanced. Each little box weighs 1 kg. What does the mystery box weigh?',
    'Undo adding 2: subtract 2 kg from BOTH sides. The highlighted boxes will be removed.',
    'Two boxes leave each side together. The scale stays balanced, and the mystery box is on its own.',
    'Four 1 kg boxes remain. The mystery box must weigh 4 kg!',
    'Check: put 4 back in place of x. 4 + 2 = 6, so both sides weigh 6 kg.',
  ];
  return (
    <div className="mystery-walkthrough">
      <p className="mystery-caption" key={step} aria-live="polite">{captions[step]}</p>
      <Scale action={action} />
      <div className="mystery-equation" aria-label="Mystery box equation">
        <p>{step === 4 ? '4 + 2 = 6' : step >= 2 ? 'x = 4' : 'x + 2 = 6'}</p>
        {step === 1 && <div className="mystery-subtract"><span>− 2</span><span>− 2</span></div>}
        {step >= 2 && <small>(x + 2) − 2 = 6 − 2</small>}
        {step >= 3 && <strong className="mystery-result">{step === 4 ? '6 kg = 6 kg ✓' : 'x = 4 kg'}</strong>}
      </div>
    </div>
  );
}

function AnswerOverlay({ correct }) {
  const [words] = useState(() => Array.from({ length: 15 }, (_, index) => ({
    x: 16 + (index % 3) * 34 + (Math.random() - 0.5) * 8,
    y: 10 + Math.floor(index / 3) * 19 + (Math.random() - 0.5) * 6,
    rotation: (Math.random() - 0.5) * 40,
    delay: Math.random() * 80,
  })));

  return createPortal(
    <div className={`answer-overlay ${correct ? 'answer-overlay-correct' : 'answer-overlay-incorrect'}`} aria-hidden="true">
      {words.map((word, index) => (
        <span key={index} style={{
          left: `${word.x}%`,
          top: `${word.y}%`,
          '--word-rotation': `${word.rotation}deg`,
          '--word-delay': `${word.delay}ms`,
        }}>{correct ? 'Correct!' : 'Incorrect!'}</span>
      ))}
    </div>,
    document.body,
  );
}

const variableLetters = 'abcdefghijklmnopqrstuvwxyz';

function BalanceChallenge({ action }) {
  const changingVariable = action === 8;
  const initial = changingVariable ? 3 : 1;
  const total = changingVariable ? 8 : 4;
  const [answer, setAnswer] = useState('');
  const [submitted, setSubmitted] = useState(null);
  const [letterIndex, setLetterIndex] = useState(0);
  const inputRef = useRef(null);
  const challengeRef = useRef(null);
  const variable = changingVariable ? variableLetters[letterIndex] : 'x';
  const correct = submitted === total - initial;
  const incorrect = submitted !== null && !correct;

  useEffect(() => {
    if (!changingVariable) return;
    const timer = window.setInterval(() => {
      setLetterIndex((current) => (current + 1 + Math.floor(Math.random() * (variableLetters.length - 1))) % variableLetters.length);
    }, 1000);
    return () => window.clearInterval(timer);
  }, [changingVariable]);

  useEffect(() => {
    if (!incorrect) return;
    const timer = window.setTimeout(() => {
      setSubmitted(null);
      setAnswer('');
      inputRef.current?.focus();
    }, 5000);
    return () => window.clearTimeout(timer);
  }, [incorrect]);

  return (
    <div ref={challengeRef} tabIndex={-1} className={`balance-challenge${correct ? ' balance-challenge-correct' : ''}${incorrect ? ' balance-challenge-incorrect' : ''}`}>
      <div className="weight-legend" aria-label="Box weights">
        <span><svg viewBox="0 0 100 100" aria-hidden="true"><WeightBox x={34} y={34} /></svg>1 little box = 1 kg</span>
        <span><svg viewBox="0 0 100 100" aria-hidden="true"><WeightBox x={18} y={18} big /></svg>1 big box = 4 kg</span>
      </div>
      <Scale action={action} added={submitted ?? 0} />
      <div className="balance-challenge-controls">
        <h2>How many little boxes do we need to add to balance this equation?</h2>
        <div className="challenge-result-row">
          <p className={`challenge-equation${changingVariable ? ' challenge-equation-variable' : ''}`}>
            {changingVariable ? '3 + ' : '1 + '}
            <span className="challenge-variable-anchor">
              <strong className="challenge-unknown">{variable}</strong>
              {changingVariable && <span className="variable-note">
                <svg viewBox="0 0 220 44" aria-hidden="true" fill="none">
                  <path d="M75 38Q185 45 196 6M186 13L196 6L202 17" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span>A variable can be any letter!</span>
              </span>}
            </span>
            {changingVariable ? ' = 8' : ' = 4'}
          </p>
        <div className={submitted === null ? 'challenge-feedback' : 'sr-only'} role="status" aria-live="polite">
          {correct ? `Correct! ${initial} + ${submitted} = ${total}. Both sides weigh ${total} kg!` : incorrect
            ? `Incorrect. The sides are not balanced. ${initial + submitted} kilograms is not equal to ${total} kilograms.`
            : 'Enter a whole number from 0 to 20.'}
        </div>
        {submitted !== null && <AnswerOverlay correct={correct} />}
        </div>
        <form className="challenge-answer" onSubmit={(event) => {
          event.preventDefault();
          if (submitted === null) {
            challengeRef.current?.focus({ preventScroll: true });
            setSubmitted(Number(answer));
          }
        }}>
          <label htmlFor="boxes-answer">{variable} =</label>
          <input ref={inputRef} id="boxes-answer" aria-label="Number of little boxes to add" type="number" min="0" max="20" step="1" required value={answer} disabled={submitted !== null} onChange={(event) => setAnswer(event.target.value)} />
          <button className="btn btn-primary" disabled={submitted !== null}>Add boxes</button>
        </form>
      </div>
      {correct && <div className="equation-confetti" aria-hidden="true">
        {Array.from({ length: 40 }, (_, index) => <i key={index} style={{ '--confetti-x': `${(index * 37 + 3) % 100}%`, '--confetti-delay': `${index * 25}ms`, '--confetti-color': ['var(--fun-orange)', 'var(--fun-teal)', 'var(--fun-purple)', 'var(--fun-yellow)'][index % 4] }} />)}
      </div>}
    </div>
  );
}

const finalChallenges = [
  { title: 'Challenge 1: Undo addition', coefficient: 1, extra: 4, total: 9, answer: 5, hint: 'Subtract 4 from both sides.', working: 'x = 9 − 4 = 5' },
  { title: 'Challenge 2: Equal groups', coefficient: 3, extra: 0, total: 18, answer: 6, hint: '3 × x means three equal groups. Divide both sides by 3.', working: 'x = 18 ÷ 3 = 6' },
  { title: 'Challenge 3: Two steps', coefficient: 2, extra: 3, total: 13, answer: 5, hint: 'First subtract 3 from both sides. Then divide both sides by 2.', working: '2 × x = 13 − 3 = 10, so x = 10 ÷ 2 = 5' },
];

function EquationChallenge({ challenge }) {
  const [answer, setAnswer] = useState('');
  const [submitted, setSubmitted] = useState(null);
  const [hintOpen, setHintOpen] = useState(false);
  const inputRef = useRef(null);
  const containerRef = useRef(null);
  const correct = submitted === challenge.answer;
  const incorrect = submitted !== null && !correct;

  useEffect(() => {
    if (!incorrect) return;
    const timer = window.setTimeout(() => {
      setSubmitted(null);
      setAnswer('');
      inputRef.current?.focus();
    }, 5000);
    return () => window.clearTimeout(timer);
  }, [incorrect]);

  return (
    <div className="balance-challenge final-equation-challenge" ref={containerRef} tabIndex={-1}>
      {(challenge.coefficient === 1 || challenge.extra === 0) && <p className="final-challenge-prompt">{challenge.coefficient === 1 ? 'One operation. Find the mystery number.' : 'Equal groups. What is the value of each x?'}</p>}
      <p className="challenge-equation">
        {challenge.coefficient > 1 && `${challenge.coefficient} × `}
        <strong className="challenge-unknown">x</strong>
        {challenge.extra > 0 && ` + ${challenge.extra}`} = {challenge.total}
      </p>
      <form className="challenge-answer" onSubmit={(event) => {
        event.preventDefault();
        if (submitted !== null) return;
        containerRef.current?.focus({ preventScroll: true });
        setSubmitted(Number(answer));
      }}>
        <label htmlFor="boxes-answer">x =</label>
        <input ref={inputRef} id="boxes-answer" aria-label="Value of x" type="number" min="0" max="20" step="1" required value={answer} disabled={submitted !== null} onChange={(event) => setAnswer(event.target.value)} />
        <button className="btn btn-primary" disabled={submitted !== null}>Check answer</button>
      </form>
      {!correct && <>
        <button className="final-challenge-hint" aria-expanded={hintOpen} onClick={() => setHintOpen((current) => !current)}>{hintOpen ? 'Hide hint' : 'Need a hint?'}</button>
        {hintOpen && <p className="final-challenge-prompt">{challenge.hint}</p>}
      </>}
      <div className="sr-only" role="status" aria-live="polite">
        {submitted === null ? 'Enter a whole number from 0 to 20.' : correct ? 'Correct! Both sides are equal.' : 'Incorrect. The sides are not equal.'}
      </div>
      {submitted !== null && <AnswerOverlay correct={correct} />}
      {correct && <div className="final-challenge-solution">
        <p>{challenge.working}</p>
        <strong>Check: {challenge.coefficient > 1 && `${challenge.coefficient} × `}{submitted}{challenge.extra > 0 && ` + ${challenge.extra}`} = {challenge.total} ✓</strong>
      </div>}
    </div>
  );
}

const equationExamples = [
  { name: 'Addition', operation: '+', amount: 3, total: 7, color: 'var(--fun-orange)', inverse: 'subtract 3', undo: '−', opposite: 'Subtraction undoes addition.', result: 4, check: '4 + 3 = 7' },
  { name: 'Subtraction', operation: '−', amount: 2, total: 5, color: 'var(--fun-pink)', inverse: 'add 2', undo: '+', opposite: 'Addition undoes subtraction.', result: 7, check: '7 − 2 = 5' },
  { name: 'Division', operation: '÷', amount: 4, total: 3, color: 'var(--fun-teal)', inverse: 'multiply by 4', undo: '×', opposite: 'Multiplication undoes division.', result: 12, check: '12 ÷ 4 = 3' },
  { name: 'Multiplication', operation: '×', amount: 3, total: 12, color: 'var(--fun-purple)', inverse: 'divide by 3', undo: '÷', opposite: 'Division undoes multiplication.', result: 4, check: '4 × 3 = 12' },
];

function SolvingSteps({ example, step }) {
  const { operation, amount, total, inverse, undo, result, check } = example;
  const instructions = [
    'First, find the operation beside x. We want to leave x on its own.',
    `Now ${inverse} on BOTH sides to keep the equation balanced.`,
    'The opposite operations cancel out. Now x is on its own!',
    'Calculate the other side to find the value of x.',
    'Put the value back into the original equation. Do both sides match?',
  ];

  return (
    <div className="equation-method" style={{ '--operation-color': example.color }}>
      <p>{example.opposite}</p>
      <p className="equation-step-instruction" key={step} aria-live="polite">{instructions[step]}</p>
      <div className="equation-step-board" aria-label="Solving steps">
        <div className="equation-step-line">
          <span>x <span className={step >= 2 ? 'equation-cancelled' : ''}>{operation} {amount}</span></span>
          <span>=</span><span>{total}</span>
        </div>
        {step >= 1 && <div className="equation-step-line equation-applied-operation">
          <span className={step >= 2 ? 'equation-cancelled' : ''}>{undo} {amount}</span>
          <span />
          <span>{undo} {amount}</span>
        </div>}
        {step >= 2 && <div className="equation-step-line equation-simplified">
          <span>x</span><span>=</span><span>{total} {undo} {amount}</span>
        </div>}
        {step >= 3 && <div className="equation-step-line equation-final-answer">
          <span>x</span><span>=</span><span>{result}</span>
        </div>}
      </div>
      {step >= 4 && <p className="equation-method-check">Check: {check} ✓</p>}
    </div>
  );
}

const equationRules = [
  { title: 'Addition rules', given: 'a + b = c', related: ['c − a = b', 'c − b = a'], examples: ['3 + 4 = 7', '7 − 3 = 4', '7 − 4 = 3'], color: 'var(--fun-orange)' },
  { title: 'Subtraction rules', given: 'a − b = c', related: ['c + b = a', 'a − c = b'], examples: ['9 − 2 = 7', '7 + 2 = 9', '9 − 7 = 2'], color: 'var(--fun-pink)' },
  { title: 'Multiplication rules', given: 'a × b = c', related: ['c ÷ a = b', 'c ÷ b = a'], examples: ['3 × 4 = 12', '12 ÷ 3 = 4', '12 ÷ 4 = 3'], note: 'a ≠ 0, b ≠ 0', color: 'var(--fun-purple)' },
  { title: 'Division rules', given: 'a ÷ b = c', related: ['c × b = a', 'a ÷ c = b'], examples: ['12 ÷ 3 = 4', '4 × 3 = 12', '12 ÷ 4 = 3'], note: 'b ≠ 0; second rule: c ≠ 0', color: 'var(--fun-teal)' },
];

function EquationRules({ rule }) {
  return (
    <div className="equation-rules" style={{ '--rule-color': rule.color }}>
      <p className="rule-given"><span>If</span>{rule.given}</p>
      <span className="rule-therefore">then</span>
      <div className="rule-related">
        {rule.related.map((equation) => <p key={equation}>{equation}</p>)}
      </div>
      {rule.note && <p className="rule-note">{rule.note}</p>}
      <section className="rule-examples" aria-label="For example">
        <h2>For example</h2>
        <div>{rule.examples.map((equation, index) => {
          const symbolic = (index === 0 ? rule.given : rule.related[index - 1]).split(' ');
          return (
            <p key={equation} aria-label={`${symbolic.join(' ')}: ${equation}`}>
              {equation.split(' ').map((part, partIndex) => (
                <span className="rule-example-part" key={partIndex} aria-hidden="true">
                  {/^[abc]$/.test(symbolic[partIndex]) && <span className="rule-example-letter">{symbolic[partIndex]}</span>}
                  <span>{part}</span>
                </span>
              ))}
            </p>
          );
        })}</div>
      </section>
    </div>
  );
}

function EquationsNextStep() {
  return (
    <div className="equations-next-step">
      <h1>You’ve made your first step in understanding how to solve <strong>THIS.</strong></h1>
      <div className="next-step-equation" role="group" aria-label="A complex equation with infinite sums, zeta and gamma functions, an integral, a product, nested roots, and large decimal numbers">
        <math display="block" aria-label="An infinite sum of a zeta function times x to the n, divided by a factorial and nested square roots">
          <munderover><mo>∑</mo><mrow><mi>n</mi><mo>=</mo><mn>1</mn></mrow><mo>∞</mo></munderover>
          <mfrac>
            <mrow><mn>98,765.4321</mn><mi>ζ</mi><mo>(</mo><mi>n</mi><mo>+</mo><mn>2</mn><mo>)</mo><msup><mi>x</mi><mi>n</mi></msup></mrow>
            <mrow><mi>n</mi><mo>!</mo><msqrt><msup><mi>x</mi><mn>2</mn></msup><mo>+</mo><msqrt><msup><mi>n</mi><mn>4</mn></msup><mo>+</mo><mn>123,456.789</mn></msqrt></msqrt></mrow>
          </mfrac>
        </math>
        <math display="block" aria-label="Plus a weighted integral from zero to pi of an exponential times cosine, divided by a square root">
          <mo>+</mo><mn>7,654.321</mn>
          <msubsup><mo>∫</mo><mn>0</mn><mi>π</mi></msubsup>
          <mfrac>
            <mrow><msup><mi>e</mi><mrow><mo>−</mo><msup><mi>t</mi><mn>2</mn></msup></mrow></msup><mi mathvariant="normal">cos</mi><mo>(</mo><mi>x</mi><mi>t</mi><mo>)</mo></mrow>
            <msqrt><mn>1</mn><mo>+</mo><msup><mi>t</mi><mn>6</mn></msup></msqrt>
          </mfrac>
          <mi mathvariant="normal">d</mi><mi>t</mi>
        </math>
        <math display="block" aria-label="Minus a large coefficient times a product of twenty logarithmic terms">
          <mo>−</mo><mn>456,789.0123</mn>
          <munderover><mo>∏</mo><mrow><mi>k</mi><mo>=</mo><mn>1</mn></mrow><mn>20</mn></munderover>
          <mrow><mo>(</mo><mn>1</mn><mo>+</mo><mfrac><mrow><mi mathvariant="normal">ln</mi><mo>(</mo><mn>1</mn><mo>+</mo><msup><mi>x</mi><mn>2</mn></msup><mo>)</mo></mrow><mrow><msup><mi>k</mi><mn>2</mn></msup><mo>+</mo><mi>π</mi></mrow></mfrac><mo>)</mo></mrow>
        </math>
        <math display="block" aria-label="Equals a large coefficient times gamma of one plus x squared, divided by zeta of three plus the fourth root of x to the fourth plus one">
          <mo>=</mo><mn>9,876,543.2109</mn>
          <mfrac>
            <mrow><mi>Γ</mi><mo>(</mo><mn>1</mn><mo>+</mo><msup><mi>x</mi><mn>2</mn></msup><mo>)</mo></mrow>
            <mrow><mi>ζ</mi><mo>(</mo><mn>3</mn><mo>)</mo><mo>+</mo><mroot><mrow><msup><mi>x</mi><mn>4</mn></msup><mo>+</mo><mn>1</mn></mrow><mn>4</mn></mroot></mrow>
          </mfrac>
        </math>
      </div>
      <p>Same idea. Two equal sides. One mystery to explore.</p>
    </div>
  );
}

function EquationsFinale() {
  const messages = ['Good job!', 'You did it!', 'Amazing!', 'Well done!', 'Keep exploring!', 'Great thinking!', 'You solved it!', 'Brilliant!'];
  const colors = ['var(--fun-orange)', 'var(--fun-teal)', 'var(--fun-purple)', 'var(--fun-pink)', 'var(--fun-yellow)'];
  return (
    <div className="equations-finale">
      <div className="finale-decorations" aria-hidden="true">
        {messages.map((message, index) => (
          <span className="finale-message" key={message} style={{
            left: `${index % 2 ? 76 : 24}%`,
            top: `${12 + Math.floor(index / 2) * 24}%`,
            '--message-turn': `${index % 2 ? 9 : -9}deg`,
            '--message-delay': `${index * 100}ms`,
            color: colors[index % colors.length],
          }}>{message}</span>
        ))}
        {Array.from({ length: 6 }, (_, index) => (
          <div className="finale-firework" key={index} style={{
            left: `${18 + (index % 3) * 32}%`,
            top: `${index < 3 ? 25 : 72}%`,
            '--burst-delay': `${index * 450}ms`,
            color: colors[index % colors.length],
          }}>
            {Array.from({ length: 16 }, (_, spark) => (
              <i key={spark} style={{ '--spark-angle': `${spark * 22.5}deg` }} />
            ))}
          </div>
        ))}
      </div>
      <div className="finale-center">
        <h1>Good job!</h1>
        <p>You brought it all into balance.</p>
        <Link to="/" className="btn btn-primary">Back to lessons</Link>
      </div>
    </div>
  );
}

export default function EquationsLesson() {
  const [action, setAction] = useState(0);
  const exampleIndex = Math.floor((action - 10) / 5);
  const focusedExample = action >= 10 && action < 30 ? equationExamples[exampleIndex] : null;
  const solvingStep = (action - 10) % 5;

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey || event.repeat) return;
      if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
      const answerField = event.target instanceof HTMLInputElement && event.target.id === 'boxes-answer';
      if (!answerField && event.target instanceof Element && event.target.closest('input, textarea, select, [contenteditable]:not([contenteditable="false"]), [role="slider"], [role="spinbutton"]')) return;
      event.preventDefault();
      setAction((current) => Math.max(0, Math.min(43, current + (event.key === 'ArrowRight' ? 1 : -1))));
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <section className={`lesson-stage equations-stage${action === 0 ? ' equations-intro' : ''}${action >= 5 && action <= 6 ? ' equations-explanation' : ''}${(action >= 7 && action <= 8) || action >= 35 ? ' equations-challenge' : ''}${action >= 9 && action < 30 ? ' equations-overview' : ''}${focusedExample ? ' equations-focused' : ''}${action >= 30 && action <= 34 ? ' equations-mystery' : ''}`} aria-label="Equations lesson" data-action={action}>
      {action === 43 ? <EquationsFinale /> : action === 42 ? <EquationsNextStep /> : <>
      <div className="fractions-title-position">
        <LessonTitle text={action === 0 ? 'Equations' : action >= 38 ? equationRules[action - 38].title : action >= 35 ? finalChallenges[action - 35].title : action >= 30 ? 'What does the box weigh?' : focusedExample ? `Undo ${focusedExample.name.toLowerCase()}` : action === 9 ? 'How do we solve each equation?' : action >= 7 ? 'Find the balance' : action === 6 ? 'Not balanced!' : action === 5 ? 'This is a simple equation!' : 'Imagine a scale'} />
        {focusedExample && <SolvingSteps key={focusedExample.name} example={focusedExample} step={solvingStep} />}
      </div>
      {action >= 38 ? <EquationRules key={action} rule={equationRules[action - 38]} /> : action >= 35 ? <EquationChallenge key={action} challenge={finalChallenges[action - 35]} /> : action >= 30 ? <MysteryWalkthrough action={action} /> : action >= 9 ? (
        <div className="equation-overview-list" role="list" aria-label="Four equations">
          {equationExamples.map(({ name, operation, amount, total, color }, index) => (
            <div className={`equation-overview-item${focusedExample && index === exampleIndex ? ' equation-overview-active' : ''}`} role="listitem" aria-current={focusedExample && index === exampleIndex ? 'step' : undefined} key={name} style={{ '--operation-color': color, '--equation-delay': `${index * 100}ms` }}>
              <span className="equation-overview-label">{name}</span>
              <p><strong>x</strong> {operation} {amount} = {total}</p>
            </div>
          ))}
        </div>
      ) : action >= 7 ? <BalanceChallenge key={action} action={action} /> : action > 0 && <Scale action={action} />}
      {action >= 4 && action <= 6 && (
        <p className="scale-equality" aria-label={action === 6 ? '4 is not equal to 3' : '3 equals 3'}>
          <span>{action === 6 ? 4 : 3}</span><span className="scale-equals">{action === 6 ? '≠' : '='}</span><span>3</span>
        </p>
      )}
      {action === 6 && (
        <p className="scale-explanation">
          The sides are <strong>no longer equal</strong>. Four is not equal to three, so 4 = 3 would be a false equation.
        </p>
      )}
      {action === 5 && (
        <p className="scale-explanation">
          An equation says that both sides have the <strong>same value</strong>—just like a balanced scale.
        </p>
      )}
      </>}
    </section>
  );
}
