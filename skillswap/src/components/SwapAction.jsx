import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import RequestDialog from './RequestDialog.jsx';
import { useApp } from '../context/AppContext.jsx';
import { swapStatus } from '../utils/matching.js';

/**
 * The one primary action for a person, based on where you stand with them:
 * Request → Requested → Respond → Message / Open swap → Completed.
 */
export default function SwapAction({ user, match, size = '', showSecondary = true }) {
  const { state, cancelRequest } = useApp();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  // Visitors always see "Request a swap", which leads them to log in first.
  const status = state.signedIn && state.profile.onboarded ? swapStatus(state, user.id) : 'none';
  const first = user.name.split(' ')[0];
  const small = size === 'sm' ? ' btn-sm' : '';

  const request = () => {
    if (!state.signedIn) {
      navigate(`/login?next=${encodeURIComponent(location.pathname + location.search)}`);
      return;
    }
    if (!state.profile.onboarded) {
      navigate('/welcome/1');
      return;
    }
    setOpen(true);
  };

  if (status === 'blocked') return null;

  if (status === 'none') {
    return (
      <>
        {/* Primary buttons keep their large label even in compact rows (contrast rule). */}
        <button type="button" className="btn btn-primary" onClick={request}>
          Request a swap
        </button>
        {open && <RequestDialog user={user} match={match} onClose={() => setOpen(false)} />}
      </>
    );
  }

  if (status === 'sent') {
    return (
      <span className="row" style={{ gap: 6 }}>
        <span className="tag tag-soft" style={{ minHeight: 40, padding: '0 12px' }}>
          Request sent
        </span>
        {showSecondary && (
          <button type="button" className={`btn btn-ghost${small}`} onClick={() => cancelRequest(user.id)}>
            Withdraw
          </button>
        )}
      </span>
    );
  }

  if (status === 'incoming') {
    return (
      <Link className="btn btn-dark" to="/swaps?tab=incoming">
        Respond to {first}
      </Link>
    );
  }

  if (status === 'active') {
    return (
      <span className="row" style={{ gap: 8 }}>
        <Link className={`btn btn-dark${small}`} to={`/messages/${user.id}`}>
          Message
        </Link>
        {showSecondary && (
          <Link className={`btn btn-secondary${small}`} to={`/swaps/${user.id}`}>
            Open swap
          </Link>
        )}
      </span>
    );
  }

  return (
    <span className="row" style={{ gap: 8 }}>
      <span className="tag tag-quiet" style={{ minHeight: 40, padding: '0 12px' }}>
        Swap completed
      </span>
      {showSecondary && (
        <Link className={`btn btn-ghost${small}`} to={`/messages/${user.id}`}>
          Message
        </Link>
      )}
    </span>
  );
}
