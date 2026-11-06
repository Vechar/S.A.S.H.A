import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import './deck.css';

/*
  Runs a lesson as a live, interactive presentation.

  lesson = { id, title, slides: [{ id, kicker, title, component, interactive, notes }] }

  Slide components receive:
    complete()  — marks the slide's activity as done (unlocks Next)
    done        — whether it was completed before

  Keys: → / PageDown = next · ← / PageUp = back · F = fullscreen · N = presenter notes
  Add ?teacher to the URL to unlock every slide.
*/
const empty = { index: 0, done: {} };

function load(key) {
  try {
    return { ...empty, ...JSON.parse(localStorage.getItem(key)) };
  } catch {
    return empty;
  }
}

export default function Deck({ lesson }) {
  const storageKey = `sasha_deck_${lesson.id}`;
  const teacher = useMemo(() => new URLSearchParams(window.location.search).has('teacher'), []);
  const [state, setState] = useState(() => load(storageKey));
  const [notesOpen, setNotesOpen] = useState(false);
  const deckRef = useRef(null);

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(state));
  }, [state, storageKey]);

  const { slides } = lesson;
  const index = Math.min(state.index, slides.length - 1);
  const slide = slides[index];
  const Body = slide.component;
  const done = Boolean(state.done[slide.id]);
  const locked = slide.interactive && !done && !teacher;

  // Furthest slide you can jump to: stop at the first unfinished activity.
  const maxReachable = useMemo(() => {
    if (teacher) return slides.length - 1;
    const i = slides.findIndex((s) => s.interactive && !state.done[s.id]);
    return i === -1 ? slides.length - 1 : i;
  }, [slides, state.done, teacher]);

  const complete = useCallback(() => {
    setState((s) => (s.done[slide.id] ? s : { ...s, done: { ...s.done, [slide.id]: true } }));
  }, [slide.id]);

  const goTo = useCallback((i) => {
    if (i < 0 || i >= slides.length || i > maxReachable) return;
    setState((s) => ({ ...s, index: i }));
    deckRef.current?.scrollTo?.({ top: 0 });
    window.scrollTo({ top: 0 });
  }, [slides.length, maxReachable]);

  const toggleFullscreen = useCallback(() => {
    if (document.fullscreenElement) document.exitFullscreen();
    else deckRef.current?.requestFullscreen?.();
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      const t = e.target;
      if (t.closest?.('input, textarea, select, [contenteditable="true"], [role="slider"]')) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === 'ArrowRight' || e.key === 'PageDown') { e.preventDefault(); if (!locked) goTo(index + 1); }
      else if (e.key === 'ArrowLeft' || e.key === 'PageUp') { e.preventDefault(); goTo(index - 1); }
      else if (e.key === 'f' || e.key === 'F') toggleFullscreen();
      else if (e.key === 'n' || e.key === 'N') setNotesOpen((o) => !o);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [goTo, index, locked, toggleFullscreen]);

  const restart = () => setState(empty);

  return (
    <div className="deck" ref={deckRef}>
      <div className="deck-top">
        <Link to="/" className="deck-home" title="All lessons">←</Link>
        <span className="deck-lesson">{lesson.title}</span>
        <nav className="deck-progress" aria-label="Slides">
          {slides.map((s, i) => (
            <button
              key={s.id}
              className={`seg ${i === index ? 'current' : ''} ${state.done[s.id] ? 'done' : ''} ${s.interactive ? 'activity' : ''}`}
              onClick={() => goTo(i)}
              disabled={i > maxReachable}
              title={`${i + 1}. ${s.title}`}
              aria-label={`Slide ${i + 1}: ${s.title}`}
              aria-current={i === index ? 'step' : undefined}
            />
          ))}
        </nav>
        <span className="deck-count mono">{String(index + 1).padStart(2, '0')} / {slides.length}</span>
      </div>

      <article className="slide" key={slide.id}>
        <header className="slide-head">
          <span className="kicker mono">{slide.kicker}</span>
          <h1 className="slide-title">{slide.title}</h1>
        </header>
        <Body complete={complete} done={done} onRestart={restart} />
      </article>

      {notesOpen && (
        <aside className="notes">
          <div className="notes-head">
            <span className="kicker mono">Presenter notes</span>
            <button className="notes-close" onClick={() => setNotesOpen(false)} aria-label="Close notes">×</button>
          </div>
          <p>{slide.notes ?? 'No notes for this slide.'}</p>
        </aside>
      )}

      <footer className="deck-bar">
        <button className="btn btn-ghost" onClick={() => goTo(index - 1)} disabled={index === 0}>← Back</button>
        <div className="deck-status">
          {slide.interactive && (
            done
              ? <span className="status-done">✓ Activity complete</span>
              : <span className="muted">{teacher ? 'Teacher mode · unlocked' : 'Complete the activity to continue'}</span>
          )}
        </div>
        <div className="deck-tools">
          <button className="tool" onClick={() => setNotesOpen((o) => !o)} title="Presenter notes (N)">N</button>
          <button className="tool" onClick={toggleFullscreen} title="Fullscreen (F)">⛶</button>
        </div>
        {index < slides.length - 1 && (
          <button className="btn btn-primary" onClick={() => goTo(index + 1)} disabled={locked}>Next →</button>
        )}
      </footer>
    </div>
  );
}
