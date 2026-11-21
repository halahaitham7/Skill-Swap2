import { useEffect, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import Logo from '../components/Logo.jsx';
import { AvailabilityFields, PhotoField, SkillEditor } from '../components/profile/ProfileFields.jsx';
import { useApp } from '../context/AppContext.jsx';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import './Auth.css';

const STEPS = [
  { title: 'Tell people a little about you', intro: 'A photo and a short bio help people decide to swap with you. You can skip the photo for now.' },
  { title: 'What can you teach?', intro: "Pick anything you're comfortable showing someone else, and be honest about your level." },
  { title: 'What do you want to learn?', intro: "Add the skills you'd like to get better at. Tell us where you're starting from." },
  { title: 'When and how do you like to learn?', intro: 'We use this to find people whose free time overlaps with yours.' },
];

export default function Onboarding() {
  const { step: stepParam } = useParams();
  const step = Math.min(4, Math.max(1, Number(stepParam) || 1));
  useDocumentTitle(`Create your profile · Step ${step} of 4`);
  const { state, updateProfile, finishOnboarding } = useApp();
  const navigate = useNavigate();
  const [draft, setDraft] = useState(() => ({ ...state.profile }));
  const [error, setError] = useState('');

  useEffect(() => {
    setError('');
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [step]);

  if (state.profile.onboarded) return <Navigate to="/dashboard" replace />;

  const patch = (p) => {
    setDraft((d) => ({ ...d, ...p }));
    setError('');
  };

  const validate = () => {
    if (step === 1 && draft.bio.trim().length < 10) return 'Write a sentence or two about yourself (at least 10 characters).';
    if (step === 2 && draft.teach.length === 0) return 'Add at least one skill you can teach.';
    if (step === 3 && draft.learn.length === 0) return 'Add at least one skill you want to learn.';
    if (step === 4 && (!draft.days.length || !draft.times.length)) return 'Pick at least one day and one time of day.';
    return '';
  };

  const next = () => {
    const problem = validate();
    if (problem) {
      setError(problem);
      return;
    }
    if (step < 4) {
      updateProfile(draft);
      navigate(`/welcome/${step + 1}`);
    } else {
      finishOnboarding(draft);
      navigate('/dashboard');
    }
  };

  const back = () => {
    updateProfile(draft);
    navigate(`/welcome/${step - 1}`);
  };

  const { title, intro } = STEPS[step - 1];

  return (
    <div className="onboarding">
      <div className="auth-top">
        <Logo />
        <span className="small muted">Saved as you go</span>
      </div>

      <div className="stack" style={{ gap: 10 }}>
        <div className="row-between">
          <span className="label">
            Step {step} of 4
          </span>
          <span className="small muted">{step === 4 ? 'Last step' : `About ${4 - step} minute${4 - step === 1 ? '' : 's'} left`}</span>
        </div>
        <div className="steps" role="progressbar" aria-valuemin={1} aria-valuemax={4} aria-valuenow={step} aria-label={`Step ${step} of 4`}>
          {[1, 2, 3, 4].map((n) => (
            <span key={n} className={n < step ? 'done' : n === step ? 'current' : ''} />
          ))}
        </div>
      </div>

      <form
        className="onboarding-step"
        onSubmit={(e) => {
          e.preventDefault();
          next();
        }}
        noValidate
      >
        <div className="stack" style={{ gap: 8 }}>
          <h1 className="h1">{title}</h1>
          <p className="lead">{intro}</p>
        </div>

        {step === 1 && (
          <>
            <PhotoField name={draft.name} palette={draft.palette} value={draft.avatar} onChange={(avatar) => patch({ avatar })} />
            <label className="field">
              <span className="field-label">Short bio</span>
              <textarea
                className="input"
                rows={4}
                maxLength={280}
                value={draft.bio}
                aria-invalid={!!error}
                placeholder="e.g. Nurse by day, home baker by night. I'd love to finally learn Spanish."
                onChange={(e) => patch({ bio: e.target.value })}
              />
              <span className="field-hint">{280 - draft.bio.length} characters left</span>
            </label>
            <label className="field">
              <span className="field-label">
                City <span className="optional">(optional, helps with in-person swaps)</span>
              </span>
              <input className="input" value={draft.location} placeholder="City, Country" onChange={(e) => patch({ location: e.target.value })} />
            </label>
          </>
        )}

        {step === 2 && <SkillEditor kind="teach" skills={draft.teach} onChange={(teach) => patch({ teach })} exclude={draft.learn.map((s) => s.name)} />}
        {step === 3 && <SkillEditor kind="learn" skills={draft.learn} onChange={(learn) => patch({ learn })} exclude={draft.teach.map((s) => s.name)} />}
        {step === 4 && <AvailabilityFields days={draft.days} times={draft.times} method={draft.method} onChange={patch} />}

        {error && (
          <p className="field-error" role="alert">
            {error}
          </p>
        )}

        <div className="onboarding-nav">
          {step > 1 ? (
            <button type="button" className="btn btn-ghost" onClick={back}>
              Back
            </button>
          ) : (
            <span />
          )}
          <button type="submit" className="btn btn-primary">
            {step === 4 ? 'Finish & see my matches' : 'Continue'}
          </button>
        </div>
      </form>
    </div>
  );
}
