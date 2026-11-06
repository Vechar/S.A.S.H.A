import { Link } from 'react-router-dom';
import './Home.css';

export default function Practice() {
  return (
    <div className="home">
      <header className="home-header">
        <span className="hero-eyebrow">A LITTLE PLAY. A LOT OF PROGRESS.</span>
        <h1 className="hero-title">Make math your playground.</h1>
        <p className="hero-subtitle">Small challenges, colorful wins. Go at your own pace.</p>
      </header>
      <section aria-labelledby="practice-title">
        <h2 id="practice-title" className="section-title">Practice</h2>
        <div className="lesson-grid">
          <Link to="/practice/quick-math" className="lesson-card">
            <span className="lesson-card-number" aria-hidden="true">+ − × ÷</span>
            <span className="lesson-card-content">
              <span className="lesson-card-subject">FOUR OPERATIONS. ENDLESS POSSIBILITIES.</span>
              <h3>Quick Math</h3>
              <span className="lesson-card-cta">Let’s play <span aria-hidden="true">→</span></span>
            </span>
          </Link>
          <Link to="/practice/equations" className="lesson-card lesson-card-equations">
            <span className="lesson-card-number" aria-hidden="true">x = ?</span>
            <span className="lesson-card-content">
              <span className="lesson-card-subject">FIND X. KEEP THE BALANCE.</span>
              <h3>Equation Quest</h3>
              <span className="lesson-card-description">Equations that grow with you. One minute to think, solve, and level up.</span>
              <span className="lesson-card-cta">Let’s play <span aria-hidden="true">→</span></span>
            </span>
          </Link>
        </div>
      </section>
    </div>
  );
}
