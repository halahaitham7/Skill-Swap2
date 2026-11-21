import { useState } from 'react';
import Modal from './Modal.jsx';
import { useApp } from '../context/AppContext.jsx';

const REASONS = ['Inappropriate messages', 'Fake profile', 'No-show or unreliable', 'Asked for money', 'Something else'];

/** Report and/or block a member. `mode` is "report" or "block". */
export default function ReportDialog({ user, mode, onClose, onDone }) {
  const { reportUser, blockUser } = useApp();
  const [reason, setReason] = useState(REASONS[0]);
  const [details, setDetails] = useState('');
  const [alsoBlock, setAlsoBlock] = useState(false);

  const submit = (e) => {
    e.preventDefault();
    if (mode === 'report') {
      reportUser(user.id, `${reason}${details ? `: ${details}` : ''}`);
      if (alsoBlock) blockUser(user.id);
    } else {
      blockUser(user.id);
    }
    onClose();
    onDone?.(mode === 'block' || alsoBlock);
  };

  if (mode === 'block') {
    return (
      <Modal title={`Block ${user.name}?`} onClose={onClose}>
        <p className="muted">
          They won't be able to message you, see your profile or appear in your matches. You can unblock them any time from My
          Profile.
        </p>
        <form onSubmit={submit} className="row" style={{ justifyContent: 'flex-end' }}>
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn-dark">
            Block
          </button>
        </form>
      </Modal>
    );
  }

  return (
    <Modal title={`Report ${user.name}`} onClose={onClose}>
      <form onSubmit={submit} className="stack">
        <fieldset style={{ border: 0, padding: 0, margin: 0 }} className="stack">
          <legend className="small" style={{ fontWeight: 700, marginBottom: 8 }}>
            What's the problem?
          </legend>
          {REASONS.map((r) => (
            <label key={r} className="checkbox">
              <input type="radio" name="reason" value={r} checked={reason === r} onChange={() => setReason(r)} />
              {r}
            </label>
          ))}
        </fieldset>
        <label className="field">
          <span className="field-label">
            Details <span className="optional">(optional)</span>
          </span>
          <textarea className="input" rows={3} value={details} onChange={(e) => setDetails(e.target.value)} />
        </label>
        <label className="checkbox">
          <input type="checkbox" checked={alsoBlock} onChange={(e) => setAlsoBlock(e.target.checked)} />
          Also block {user.name.split(' ')[0]}
        </label>
        <div className="row" style={{ justifyContent: 'flex-end' }}>
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary">
            Send report
          </button>
        </div>
      </form>
    </Modal>
  );
}
