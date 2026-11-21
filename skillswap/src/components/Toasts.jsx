import { useEffect } from 'react';
import { useApp } from '../context/AppContext.jsx';
import Icon from './Icon.jsx';

function Toast({ toast, onDismiss }) {
  // Auto-dismiss after a few seconds.
  useEffect(() => {
    const timer = setTimeout(() => onDismiss(toast.id), 4000);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  return (
    <div className={`toast ${toast.tone}`} role="status">
      <span className="text">{toast.text}</span>
      <button type="button" className="icon-btn" aria-label="Dismiss" onClick={() => onDismiss(toast.id)}>
        <Icon name="close" size={16} />
      </button>
    </div>
  );
}

export default function Toasts() {
  const { toasts, dismissToast } = useApp();
  return (
    <div className="toast-region" aria-live="polite">
      {toasts.slice(-3).map((t) => (
        <Toast key={t.id} toast={t} onDismiss={dismissToast} />
      ))}
    </div>
  );
}
