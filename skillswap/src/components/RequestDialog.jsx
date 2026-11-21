import { useState } from 'react';
import Modal from './Modal.jsx';
import { useApp } from '../context/AppContext.jsx';

/** Short form for proposing a swap: what you'll teach, what you'd learn, a note. */
export default function RequestDialog({ user, match, onClose }) {
  const { state, sendRequest } = useApp();
  const { profile } = state;
  const first = user.name.split(' ')[0];

  const [teach, setTeach] = useState(match.theyWantFromMe[0] || profile.teach[0]?.name || '');
  const [learn, setLearn] = useState(match.theyTeachForMe[0] || user.teaches[0].name);
  const [message, setMessage] = useState(`Hi ${first}! I'd love to swap: I can teach you ${match.theyWantFromMe[0] || profile.teach[0]?.name || 'something new'}, and I'd like to learn ${match.theyTeachForMe[0] || user.teaches[0].name}.`);
  const [error, setError] = useState('');

  const submit = (e) => {
    e.preventDefault();
    if (message.trim().length < 10) {
      setError(`Add a short hello so ${first} knows what you have in mind.`);
      return;
    }
    sendRequest(user.id, { teach, learn, message: message.trim() });
    onClose();
  };

  return (
    <Modal title={`Request a swap with ${first}`} onClose={onClose}>
      <p className="muted small">
        {first} will see your request in their Swaps. Once they accept, you can message each other and book your first session.
      </p>
      <form className="stack" onSubmit={submit} noValidate>
        <div className="grid-fit" style={{ '--min': '200px', '--gap': '12px' }}>
          <label className="field">
            <span className="field-label">You'll teach</span>
            <select className="input" value={teach} onChange={(e) => setTeach(e.target.value)}>
              {profile.teach.map((s) => (
                <option key={s.name} value={s.name}>
                  {s.name}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span className="field-label">You'd like to learn</span>
            <select className="input" value={learn} onChange={(e) => setLearn(e.target.value)}>
              {user.teaches.map((s) => (
                <option key={s.name} value={s.name}>
                  {s.name}
                </option>
              ))}
            </select>
          </label>
        </div>
        <label className="field">
          <span className="field-label">Message</span>
          <textarea
            className="input"
            rows={4}
            value={message}
            aria-invalid={!!error}
            onChange={(e) => {
              setMessage(e.target.value);
              setError('');
            }}
          />
          {error ? <span className="field-error">{error}</span> : <span className="field-hint">Say hello and when you're usually free.</span>}
        </label>
        <div className="row" style={{ justifyContent: 'flex-end' }}>
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary">
            Send request
          </button>
        </div>
      </form>
    </Modal>
  );
}
