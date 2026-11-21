import { Navigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';

/**
 * Guards signed-in pages. Visitors go to Log in (and come back afterwards);
 * members who haven't finished their profile go to onboarding first.
 */
export default function RequireAuth({ children, allowIncomplete = false }) {
  const { state } = useApp();
  const location = useLocation();

  if (!state.signedIn) {
    const next = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?next=${next}`} replace />;
  }
  if (!allowIncomplete && !state.profile.onboarded) {
    return <Navigate to="/welcome/1" replace />;
  }
  return children;
}
