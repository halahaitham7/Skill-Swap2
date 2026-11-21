import { useState } from 'react';
import Modal from './Modal.jsx';
import StarRating from './StarRating.jsx';
import ToggleGroup from './ToggleGroup.jsx';
import { useApp } from '../context/AppContext.jsx';

const TAGS = ['Patient', 'Well prepared', 'Clear explanations', 'On time', 'Fun to learn with'];

/** Ends a swap and leaves a review of the other person. */
export default function CompleteSwapDialog({ user, onClose }) {
  const { completeSwap } = useApp();
  const first = user.name.split(' ')[0];
  const [rating, setRating] = useState(5);
  const [tags, setTags] = useState([]);
  const [text, setText] = useState('');

  const submit = (e) => {
    e.preventDefault();
    completeSwap(user.id, { rating, tags, text: text.trim() });
    onClose();
  };

  return (
    <Modal title={`Complete your swap with ${first}`} onClose={onClose}>
      <p className="muted small">This ends the swap for both of you and adds your review to {first}'s profile. Your chat history stays.</p>
      <form className="stack" onSubmit={submit}>
        <div className="stack" style={{ gap: 8 }}>
          <span className="field-label">How was learning with {first}?</span>
          <StarRating value={rating} onChange={setRating} />
        </div>
        <div className="stack" style={{ gap: 8 }}>
          <span className="field-label">
            What stood out? <span className="optional">(optional)</span>
          </span>
          <ToggleGroup label="What stood out" options={TAGS} value={tags} onChange={setTags} size="sm" />
        </div>
        <label className="field">
          <span className="field-label">
            Review <span className="optional">(optional)</span>
          </span>
          <textarea className="input" rows={3} value={text} onChange={(e) => setText(e.target.value)} placeholder={`What did you learn from ${first}?`} />
        </label>
        <div className="row" style={{ justifyContent: 'flex-end' }}>
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Not yet
          </button>
          <button type="submit" className="btn btn-primary">
            Complete swap
          </button>
        </div>
      </form>
    </Modal>
  );
}
