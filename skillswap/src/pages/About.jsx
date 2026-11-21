import { Link } from 'react-router-dom';
import Photo from '../components/Photo.jsx';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import './Content.css';

// Mission and values come from the SkillSwap product vision.
const VALUES = [
  { title: 'Knowledge sharing', text: 'What you know is valuable to someone, so share it.' },
  { title: 'Community', text: 'Real people helping each other, not a course catalogue.' },
  { title: 'Human connection', text: 'Learning happens best between two people who care.' },
  { title: 'Personal growth', text: 'Teaching deepens what you know, and learning opens new doors.' },
  { title: 'Equal opportunities', text: 'Everyone gets the chance to learn, whatever their budget.' },
  { title: 'Learning without money', text: 'Swap skills instead of paying for lessons.' },
];

export default function About() {
  useDocumentTitle('About Us');
  return (
    <div className="container">
      <header className="content-hero">
        <span className="label">About Us</span>
        <h1 className="display" style={{ fontSize: 'clamp(36px, 5vw, 60px)' }}>
          Education shouldn't depend on what you can pay
        </h1>
        <p className="lead">
          SkillSwap is a place where people exchange knowledge and skills without money. Everyone knows something, and everyone has something to learn.
        </p>
      </header>

      <Photo name="about" ratio="21 / 9" sizes="(max-width: 1240px) 100vw, 1200px" priority className="about-photo" />

      <section className="content-grid" aria-labelledby="mission-title">
        <h2 id="mission-title" className="h2">
          What we believe
        </h2>
        <ul className="values">
          {VALUES.map((v) => (
            <li key={v.title}>
              <h3 className="h3">{v.title}</h3>
              <p className="muted">{v.text}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="content-grid" aria-labelledby="story-title">
        <h2 id="story-title" className="h2">
          Our story
        </h2>
        <div className="stack" style={{ gap: 20 }}>
          <div className="content-needed" role="note">
            <span className="label">Content needed from the SkillSwap team</span>
            <p>Who started SkillSwap, why, and who is behind it today. This section stays empty until the team supplies the real story. We don't invent it.</p>
          </div>
        </div>
      </section>

      <section className="content-grid" id="demo" aria-labelledby="demo-title">
        <h2 id="demo-title" className="h2">
          About demo mode
        </h2>
        <div className="stack" style={{ gap: 12 }}>
          <p>This version of SkillSwap runs without a server, so you can try the whole experience safely:</p>
          <ul style={{ margin: 0, paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 6 }}>
            <li>Your account, profile, swaps and messages are saved only in this browser.</li>
            <li>Passwords are checked for length but never stored or sent anywhere.</li>
            <li>The other members are samples. They don't answer requests, and chat replies are simulated.</li>
            <li>Use “Explore the demo as Sara” to see an account with active swaps and history.</li>
          </ul>
          <p className="muted small">Real accounts, matching between real people and live chat arrive with the SkillSwap server.</p>
          <div className="row" style={{ marginTop: 8 }}>
            <Link className="btn btn-primary" to="/signup">
              Create your profile
            </Link>
            <Link className="btn btn-secondary" to="/how-it-works">
              How it works
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
