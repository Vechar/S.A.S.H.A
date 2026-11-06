import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation, useMatch } from 'react-router-dom';
import './Navbar.css';

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const toggleRef = useRef(null);
  const isLesson = Boolean(useMatch('/lesson/:lessonId'));
  const { pathname } = useLocation();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <div
      className={`navbar-reveal${isLesson ? ' navbar-reveal-lesson' : ''}${open ? ' navbar-reveal-open' : ''}`}
      onPointerDown={(event) => {
        if (event.pointerType === 'touch' && event.target === event.currentTarget) setOpen(true);
      }}
      onPointerEnter={(event) => {
        if (event.pointerType === 'mouse') setOpen(true);
      }}
      onPointerLeave={(event) => {
        if (event.pointerType === 'mouse') setOpen(false);
      }}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
      }}
      onKeyDown={(event) => {
        if (event.key === 'Escape') {
          setOpen(false);
          toggleRef.current?.focus();
        }
      }}
    >
      <button
        ref={toggleRef}
        className="navbar-toggle"
        aria-label={open ? 'Close navigation' : 'Open navigation'}
        aria-expanded={open}
        aria-controls="site-navigation"
        onClick={() => setOpen((current) => !current)}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d={open ? 'M6 6L18 18M6 18L18 6' : 'M4 7H20M4 12H20M4 17H20'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
        <span>Menu</span>
      </button>
      <header id="site-navigation" className="navbar" inert={!open} onClick={(event) => {
        if (event.target.closest('a')) {
          setOpen(false);
          toggleRef.current?.focus();
        }
      }}>
        <Link to="/" className="navbar-logo">
          <span className="logo-text">S.A.S.H.A</span>
        </Link>

        <nav className="navbar-links">
          <NavLink to="/" end className="nav-link">Lessons</NavLink>
          <NavLink to="/practice" className="nav-link">Practice</NavLink>
        </nav>
      </header>
    </div>
  );
}
