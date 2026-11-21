import SwapTicket from '../components/SwapTicket.jsx';

/** Right-hand panel on Sign up / Log in that explains the idea in one look. */
export default function AuthAside() {
  return (
    <aside className="auth-aside" aria-label="How SkillSwap works">
      <h2>Everyone knows something. Everyone has something to learn.</h2>
      <SwapTicket
        compact
        perfect
        left={{ label: 'Sara teaches', skill: 'Photography', meta: 'Advanced' }}
        right={{ label: 'Ahmed teaches', skill: 'English', meta: 'Native' }}
        reason="Each teaches what the other wants. Nobody pays."
      />
      <ol>
        <li>
          <b>1</b>
          <span>Tell us what you can teach and what you want to learn.</span>
        </li>
        <li>
          <b>2</b>
          <span>We show you people whose skills fit yours both ways.</span>
        </li>
        <li>
          <b>3</b>
          <span>Request a swap, agree a time, and start learning.</span>
        </li>
      </ol>
    </aside>
  );
}
