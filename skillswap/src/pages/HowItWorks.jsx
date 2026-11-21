import { Link } from 'react-router-dom';
import SwapTicket from '../components/SwapTicket.jsx';
import { useApp } from '../context/AppContext.jsx';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import './Content.css';

const STEPS = [
  { title: 'Create your profile', text: "Sign up with your name and email, then answer four short questions: a little about you, what you can teach, what you want to learn, and when you're free. It takes about two minutes." },
  { title: 'Find a compatible partner', text: 'Your dashboard shows your best matches first. A perfect match teaches something you want and wants something you teach. Use Explore Skills to search and filter by category, level, time and online or in person.' },
  { title: 'Request a swap', text: "On someone's profile, the swap ticket shows exactly what you'd teach each other. Press Request a swap, choose the skills, and add a short hello." },
  { title: 'Agree and plan', text: 'When they accept, chat opens. Agree on goals and propose your first session. You can meet online or in person, for 30 to 90 minutes.' },
  { title: 'Learn, then complete the swap', text: 'Mark each session as done to track your progress. When you have both learned what you wanted, complete the swap and leave a review.' },
];

const FAQ = [
  { q: 'Does it cost anything?', a: "No. SkillSwap is free, and no money ever changes hands. You pay for lessons by teaching what you know." },
  { q: "What if I'm a beginner at everything?", a: 'Everyone knows something: a language, a recipe, a hobby, a work skill. Set your level honestly. Many people want to learn from someone just a step ahead of them.' },
  { q: "What if there's no perfect match?", a: 'Try someone who wants your skill or teaches what you want. Many swaps start one-way and grow. You can also add more skills to your profile to widen your matches.' },
  { q: 'How do I stay safe?', a: 'Meet on video first, meet in public places, and never share bank details. Every profile and chat has Report and Block options, and we review reports within 24 hours.' },
  { q: 'Is this the real platform?', a: 'Not yet. SkillSwap is running in demo mode, so accounts and messages are saved only in your browser, and sample members don’t reply for real.' },
];

export default function HowItWorks() {
  useDocumentTitle('How It Works');
  const { state } = useApp();
  const member = state.signedIn && state.profile.onboarded;

  return (
    <div className="container">
      <header className="content-hero">
        <span className="label">How It Works</span>
        <h1 className="display" style={{ fontSize: 'clamp(36px, 5vw, 60px)' }}>
          Skill exchange in plain words
        </h1>
        <p className="lead">You teach someone what you know. They teach you what they know. Both of you learn, and nobody pays.</p>
      </header>

      <section className="content-grid" aria-labelledby="example-title">
        <div className="stack" style={{ gap: 8 }}>
          <h2 id="example-title" className="h2">
            An example
          </h2>
          <p className="muted">Sara knows photography and wants to learn English. Ahmed knows English and wants to learn photography.</p>
        </div>
        <SwapTicket
          perfect
          left={{ label: 'Sara teaches', skill: 'Photography', meta: 'Advanced' }}
          right={{ label: 'Ahmed teaches', skill: 'English', meta: 'Native speaker' }}
          reason="SkillSwap matches them, so they meet weekly: 30 minutes of English, then 30 minutes of photography."
        />
      </section>

      <section className="content-grid" aria-labelledby="steps-title">
        <h2 id="steps-title" className="h2">
          Step by step
        </h2>
        <ol style={{ listStyle: 'none', margin: 0, padding: 0 }}>
          {STEPS.map((s, i) => (
            <li key={s.title} className="step-detail">
              <span className="num">{i + 1}</span>
              <div className="stack" style={{ gap: 6 }}>
                <h3 className="h3">{s.title}</h3>
                <p className="muted">{s.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="content-grid" aria-labelledby="faq-title">
        <h2 id="faq-title" className="h2">
          Common questions
        </h2>
        <div className="faq">
          {FAQ.map((f) => (
            <details key={f.q}>
              <summary>{f.q}</summary>
              <p>{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="content-grid" style={{ alignItems: 'center' }}>
        <h2 className="h2">Ready to try it?</h2>
        <div className="row">
          <Link className="btn btn-primary" to={member ? '/explore' : '/signup'}>
            {member ? 'Find a skill partner' : 'Create your profile'}
          </Link>
          <Link className="btn btn-secondary" to="/explore">
            Browse skills first
          </Link>
        </div>
      </section>
    </div>
  );
}
