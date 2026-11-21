import { Link } from 'react-router-dom';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';

export default function NotFound() {
  useDocumentTitle('Page not found');
  return (
    <div className="container page">
      <div className="empty center" style={{ padding: '64px 24px' }}>
        <span className="label">Error 404</span>
        <h1 className="h1">We couldn't find that page</h1>
        <p className="muted">The link may be broken, or the page may have moved.</p>
        <div className="row" style={{ justifyContent: 'center' }}>
          <Link className="btn btn-secondary" to="/">
            Go home
          </Link>
          <Link className="btn btn-dark" to="/explore">
            Explore skills
          </Link>
        </div>
      </div>
    </div>
  );
}
