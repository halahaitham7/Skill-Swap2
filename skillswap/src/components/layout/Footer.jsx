import { Link } from 'react-router-dom';
import Logo from '../Logo.jsx';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-inner">
        <div className="stack" style={{ gap: 12, maxWidth: 360 }}>
          <Logo />
          <p className="muted small">Everyone knows something. Everyone has something to learn. Exchange skills, not money.</p>
        </div>
        <div className="footer-cols">
          <div>
            <strong>SkillSwap</strong>
            <Link to="/explore">Explore Skills</Link>
            <Link to="/how-it-works">How It Works</Link>
            <Link to="/about">About Us</Link>
          </div>
          <div>
            <strong>Community</strong>
            <Link to="/community">Tips &amp; stories</Link>
            <Link to="/community#guidelines">Guidelines</Link>
            <Link to="/community#safety">Staying safe</Link>
          </div>
          <div>
            <strong>Account</strong>
            <Link to="/signup">Sign up</Link>
            <Link to="/login">Log in</Link>
            <Link to="/about#demo">About demo mode</Link>
          </div>
        </div>
      </div>
      <div className="container footer-base">
        <span>© {new Date().getFullYear()} SkillSwap</span>
        <span>Demo mode · your data stays in this browser</span>
      </div>
    </footer>
  );
}
