import { Link } from 'react-router-dom';
import './Home.css';

export default function Home() {
  return (
    <div className="home">
      <header className="home-header">
        <span className="hero-eyebrow">A SPACE TO EXPLORE</span>
        <h1 className="hero-title">Curiosity starts here.</h1>
        <p className="hero-subtitle">Pick a lesson. We’ll build the rest together, one step at a time.</p>
      </header>

      <section aria-labelledby="lessons-title">
        <h2 id="lessons-title" className="section-title">Lessons</h2>
        <div className="lesson-grid">
          <Link to="/lesson/1" className="lesson-card lesson-card-fractions">
            <div className="lesson-card-picture" aria-hidden="true">
              <span className="lesson-card-number">01</span>
              <svg viewBox="0 0 400 240" fill="none">
                <circle cx="200" cy="124" r="95" fill="currentColor" opacity=".08" />
                <ellipse cx="198" cy="207" rx="100" ry="12" fill="#111528" opacity=".3" />
                <g transform="rotate(-12 190 120)">
                  <circle cx="185" cy="123" r="78" fill="#e9ad83" />
                  <circle cx="185" cy="123" r="67" fill="#d67460" />
                  <circle cx="185" cy="123" r="61" fill="#e8d38d" />
                  <path d="M185 123L263 123A78 78 0 0 1 185 201Z" fill="#252d4b" />
                  <path d="M201 139H279A78 78 0 0 1 201 217Z" fill="#e9ad83" />
                  <path d="M207 145H267A65 65 0 0 1 207 205Z" fill="#e8d38d" />
                  {[[158, 90], [211, 85], [145, 139], [178, 166], [232, 161]].map(([x, y]) => (
                    <circle key={x} cx={x} cy={y} r="11" fill="#d67460" />
                  ))}
                  <path d="M185 47V123H109M185 123L239 69" stroke="#bd824e" strokeWidth="3" strokeLinecap="round" />
                </g>
                <g transform="rotate(10 306 65)">
                  <rect x="273" y="30" width="64" height="72" rx="18" fill="#1b213a" />
                  <text x="305" y="59" textAnchor="middle" fill="#e8d38d" fontSize="24" fontWeight="700">1</text>
                  <path d="M291 66H319" stroke="#a5aecb" strokeWidth="2" />
                  <text x="305" y="90" textAnchor="middle" fill="#e9ad83" fontSize="24" fontWeight="700">4</text>
                </g>
                <path d="M83 51V67M75 59H91M317 166V178M311 172H323" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
              </svg>
              <span className="lesson-card-tag">Parts of a whole</span>
            </div>
            <span className="lesson-card-content">
              <span className="lesson-card-subject">YOUR FIRST LESSON</span>
              <h3>Fractions</h3>
              <span className="lesson-card-description">A pizza, a little sharing, and a whole new way to see numbers.</span>
              <span className="lesson-card-cta">Open lesson <span aria-hidden="true">→</span></span>
            </span>
          </Link>
          <Link to="/lesson/2" className="lesson-card lesson-card-equations">
            <div className="lesson-card-picture" aria-hidden="true">
              <span className="lesson-card-number">02</span>
              <svg viewBox="0 0 400 240" fill="none">
                <circle cx="200" cy="121" r="95" fill="currentColor" opacity=".08" />
                <ellipse cx="200" cy="211" rx="102" ry="11" fill="#111528" opacity=".3" />
                <path d="M200 84V195M172 201H228" stroke="#a9b8ff" strokeWidth="10" strokeLinecap="round" />
                <path d="M100 90H300" stroke="#a9b8ff" strokeWidth="7" strokeLinecap="round" />
                <circle cx="200" cy="90" r="12" fill="#e8d38d" />
                <path d="M112 94L83 158H141L112 94ZM288 94L259 158H317L288 94Z" stroke="#7ecacb" strokeWidth="3" strokeLinejoin="round" />
                <path d="M77 158H147Q142 178 112 178Q82 178 77 158ZM253 158H323Q318 178 288 178Q258 178 253 158Z" fill="#7ecacb" />
                <rect x="93" y="119" width="38" height="37" rx="9" fill="#b99df4" />
                <text x="112" y="146" textAnchor="middle" fill="#171d35" fontSize="27" fontWeight="700">x</text>
                <rect x="268" y="122" width="18" height="33" rx="5" fill="#e9ad83" />
                <rect x="290" y="122" width="18" height="33" rx="5" fill="#e8d38d" />
                <g transform="rotate(-8 305 51)">
                  <rect x="270" y="29" width="70" height="44" rx="14" fill="#1b213a" />
                  <path d="M291 46H319M291 57H319" stroke="#b99df4" strokeWidth="4" strokeLinecap="round" />
                </g>
                <path d="M77 50V66M69 58H85M330 182V194M324 188H336" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
              </svg>
              <span className="lesson-card-tag">Find the mystery number</span>
            </div>
            <span className="lesson-card-content">
              <span className="lesson-card-subject">YOUR SECOND LESSON</span>
              <h3>Equations</h3>
              <span className="lesson-card-description">Every mystery has a clue. Let’s find the number that fits.</span>
              <span className="lesson-card-cta">Open lesson <span aria-hidden="true">→</span></span>
            </span>
          </Link>
        </div>
      </section>
    </div>
  );
}
