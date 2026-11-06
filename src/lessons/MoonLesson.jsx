import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './moon.css';

export const moonPhases = [
  { name: 'New Moon', image: 'new-moon', fraction: '0', amount: '0 lit', text: 'The lit half faces away from us.' },
  { name: 'Waxing Crescent', image: 'waxing-crescent', fraction: '1/4', amount: '≈ 1/4 lit', text: 'A growing crescent of light.' },
  { name: 'First Quarter', image: 'first-quarter', fraction: '1/2', amount: '1/2 lit', text: 'Quarter of the way through the cycle. Half of the face is lit.' },
  { name: 'Waxing Gibbous', image: 'waxing-gibbous', fraction: '3/4', amount: '≈ 3/4 lit', text: 'Growing toward a full Moon.' },
  { name: 'Full Moon', image: 'full', fraction: '1', amount: '1 whole face lit', text: 'The whole face we see is lit.' },
  { name: 'Waning Gibbous', image: 'waning-gibbous', fraction: '3/4', amount: '≈ 3/4 lit', text: 'The light is shrinking after Full Moon.' },
  { name: 'Third Quarter', image: 'third-quarter', fraction: '1/2', amount: '1/2 lit', text: 'Half lit again, on the other side. Also called Last Quarter.' },
  { name: 'Waning Crescent', image: 'waning-crescent', fraction: '1/4', amount: '≈ 1/4 lit', text: 'A shrinking crescent before New Moon.' },
];

const fractionChoices = ['0', '1/4', '1/2', '3/4', '1'];

export function MoonPicture({ phase, quiz = false }) {
  const [failed, setFailed] = useState(false);
  return (
    <figure className="moon-picture">
      {failed
        ? <p role="alert">The {phase.name} image could not load. Please reload the page.</p>
        : <img src={`/moon/${phase.image}.jpg`} alt={quiz ? 'Moon phase to identify' : `NASA image of the ${phase.name} phase`} width="640" height="613" onError={() => setFailed(true)} />}
      <figcaption><a href="https://science.nasa.gov/moon/moon-phases/" target="_blank" rel="noreferrer">Moon imagery: NASA</a></figcaption>
    </figure>
  );
}

export function MoonIntro() {
  return (
    <div className="moon-intro">
      <h2>One Moon. Eight phases.</h2>
      <p>What fraction of the face we see is lit?</p>
      <div className="moon-phase-strip">
        {moonPhases.map((phase) => (
          <div key={phase.name}>
            <MoonPicture phase={phase} />
            <span>{phase.name}</span>
          </div>
        ))}
      </div>
      <p className="moon-note">Same whole Moon. Different amounts of light.</p>
      <a className="moon-credit" href="https://science.nasa.gov/moon/moon-phases/" target="_blank" rel="noreferrer">Images and phase guide: NASA</a>
    </div>
  );
}

export function MoonPhaseLesson({ action }) {
  const phaseIndex = action - 20;
  const phase = moonPhases[phaseIndex];
  return (
    <div className="moon-phase-scene" key={phase.name}>
      <MoonPicture phase={phase} />
      <div className="moon-phase-copy">
        <span className="moon-eyebrow">PHASE {phaseIndex + 1} OF 8</span>
        <h2>{phase.name}</h2>
        <p className="moon-amount">{phase.amount}</p>
        <p>{phase.text}</p>
        {(phase.fraction === '1/4' || phase.fraction === '3/4') && <p className="moon-note">≈ means about. This is a rough estimate; the lit amount changes each night.</p>}
      </div>
    </div>
  );
}

export function MoonLightDirection({ action }) {
  const waxing = action === 18;
  const phases = waxing ? moonPhases.slice(0, 5) : [moonPhases[4], ...moonPhases.slice(5), moonPhases[0]];
  return (
    <div className="moon-intro moon-direction">
      <h2>{waxing ? 'Waxing' : 'Waning'}</h2>
      <p className="moon-amount">{waxing ? 'More light each night' : 'Less light each night'}</p>
      <div className="moon-direction-strip">
        {phases.map((phase, index) => (
          <div key={phase.name}>
            <MoonPicture phase={phase} />
            <span>{phase.name}</span>
            {index < phases.length - 1 && <span className="moon-direction-arrow" aria-hidden="true">→</span>}
          </div>
        ))}
      </div>
      <p className="moon-note">The Moon stays whole. Only the lit part we see changes.</p>
    </div>
  );
}

function shuffled(items) {
  const phases = [...items];
  for (let index = phases.length - 1; index > 0; index--) {
    const swap = Math.floor(Math.random() * (index + 1));
    [phases[index], phases[swap]] = [phases[swap], phases[index]];
  }
  if (phases.every((phase, index) => phase === items[index])) {
    phases.push(phases.shift());
  }
  return phases;
}

export function createMoonQuiz() {
  return shuffled(moonPhases).map((phase) => ({
    phase,
    names: shuffled(moonPhases.map((option) => option.name)),
    fractions: shuffled(fractionChoices),
  }));
}

export function MoonMatchingQuiz({ Feedback, action, moonQuiz, onNext }) {
  const index = action - 28;
  const { phase, names, fractions } = moonQuiz[index];
  const [name, setName] = useState('');
  const [fraction, setFraction] = useState('');
  const [attempt, setAttempt] = useState(0);
  const [checked, setChecked] = useState(false);
  const correct = checked && name === phase.name && fraction === phase.fraction;

  return (
    <div className="moon-matching">
      <p className="moon-eyebrow">MOON {index + 1} OF {moonQuiz.length}</p>
      <h2>Name this Moon</h2>
      <p>Which phase is it? What fraction is lit?</p>
      <form onSubmit={(event) => {
        event.preventDefault();
        setChecked(true);
        setAttempt((current) => current + 1);
      }}>
        <fieldset className="moon-match-card">
          <legend>Choose both matches</legend>
          <MoonPicture phase={phase} quiz />
          <label>
            Phase name
            <select required disabled={correct} value={name} onChange={(event) => { setName(event.target.value); setChecked(false); }}>
              <option value="">Choose a phase</option>
              {names.map((option) => <option key={option} value={option}>{option}</option>)}
            </select>
          </label>
          <label>
            Fraction lit
            <select required disabled={correct} value={fraction} onChange={(event) => { setFraction(event.target.value); setChecked(false); }}>
              <option value="">Choose a fraction</option>
              {fractions.map((option) => <option key={option} value={option}>{option === '1/4' || option === '3/4' ? `≈ ${option}` : option}</option>)}
            </select>
          </label>
        </fieldset>
        {correct
          ? <button type="button" className="btn btn-primary" onClick={onNext}>{index === moonQuiz.length - 1 ? 'See today’s Moon →' : 'Next Moon →'}</button>
          : <button type="submit" className="btn btn-primary" disabled={!name || !fraction}>Check answer</button>}
      </form>
      <Feedback answered={checked} correct={correct} attempt={attempt} />
      <p className="moon-note">Crescents ≈ 1/4 · Gibbous ≈ 3/4. Estimates, not fixed amounts.<br />Northern Hemisphere view.</p>
    </div>
  );
}

export function CurrentMoon({ onNext }) {
  const [request, setRequest] = useState(0);
  const [state, setState] = useState({ status: 'loading' });

  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    const timeout = setTimeout(() => controller.abort(), 15000);
    async function load() {
      try {
        const hour = new Date().toISOString().slice(0, 13) + ':00';
        const response = await fetch(`/api/moon/${hour}`, { signal: controller.signal });
        if (!response.ok) throw new Error(`NASA request failed (${response.status}).`);
        const data = await response.json();
        if (!Number.isFinite(data.phase) || data.phase < 0 || data.phase > 100 ||
            !Number.isFinite(data.age) || data.age < 0 || data.age > 30 ||
            typeof data.time !== 'string' || data.time !== hour ||
            typeof data.image?.url !== 'string') {
          throw new Error('NASA returned incomplete Moon data.');
        }
        const image = new URL(data.image.url);
        if (image.hostname !== 'svs.gsfc.nasa.gov' || !['https:', 'http:'].includes(image.protocol)) {
          throw new Error('NASA returned an unexpected Moon image address.');
        }
        image.protocol = 'https:';
        const waxing = data.age < 14.765;
        const phaseName = data.phase < 1 ? 'New Moon' : data.phase > 99 ? 'Full Moon'
          : data.phase >= 49 && data.phase <= 51 ? (waxing ? 'First Quarter' : 'Third Quarter')
            : `${waxing ? 'Waxing' : 'Waning'} ${data.phase < 50 ? 'Crescent' : 'Gibbous'}`;
        if (active) setState({ status: 'ready', data, image: image.href, phaseName });
      } catch (error) {
        if (active) setState({ status: 'error', message: error.name === 'AbortError' ? 'The Moon request timed out.' : error.message });
      } finally {
        clearTimeout(timeout);
      }
    }
    load();
    return () => { active = false; clearTimeout(timeout); controller.abort(); };
  }, [request]);

  const retry = () => { setState({ status: 'loading' }); setRequest((value) => value + 1); };
  return (
    <div className="moon-today">
      <h2>The Moon today</h2>
      {state.status === 'loading' && <p role="status">Asking NASA for the latest Moon…</p>}
      {state.status === 'error' && <div role="alert">
        <p>We couldn’t load today’s Moon. {state.message}</p>
        <button type="button" className="btn btn-primary" onClick={retry}>Try again</button>
      </div>}
      {state.status === 'ready' && <>
        <figure className="moon-picture">
          <img src={state.image} width="730" height="730" alt={`NASA visualization of today's ${state.phaseName}`} onError={() => setState({ status: 'error', message: 'The current Moon image could not load.' })} />
          <figcaption>Hourly visualization · NASA / SVS · North up</figcaption>
        </figure>
        <h3>{state.phaseName}</h3>
        <p className="moon-amount">≈ {Math.round(state.data.phase)}/100 lit</p>
        <p>{state.data.phase.toFixed(1)}% of the face we see is illuminated.</p>
        <p className="moon-note">Observed time: {state.data.time.replace('T', ' ')} UTC<br />Phase names describe a continuous cycle.</p>
      </>}
      <a className="moon-credit" href="https://svs.gsfc.nasa.gov/gallery/moonphase/" target="_blank" rel="noreferrer">Live data and imagery: NASA Dial-A-Moon</a>
      <button type="button" className="btn btn-primary" onClick={onNext}>Finish lesson →</button>
    </div>
  );
}

export function LessonEnd() {
  return (
    <div className="moon-ending">
      <p className="moon-amount">One whole lesson. Well done!</p>
      <Link to="/" className="btn btn-primary">Back to lessons</Link>
    </div>
  );
}
