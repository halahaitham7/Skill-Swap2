import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import Logo from '../components/Logo.jsx';
import { useApp } from '../context/AppContext.jsx';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import AuthAside from './AuthAside.jsx';
import './Auth.css';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function PasswordInput({ id, value, onChange, invalid, autoComplete, describedBy }) {
  const [show, setShow] = useState(false);
  return (
    <div className="password-wrap">
      <input
        id={id}
        className="input"
        type={show ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        aria-invalid={invalid}
        aria-describedby={describedBy}
        autoComplete={autoComplete}
      />
      <button type="button" className="btn btn-ghost reveal" aria-pressed={show} onClick={() => setShow((s) => !s)}>
        {show ? 'Hide' : 'Show'}
      </button>
    </div>
  );
}

export function DemoNote() {
  return (
    <p className="demo-note" role="note">
      <strong>Demo mode.</strong>
      <span>
        Your account is saved only in this browser, and passwords aren't stored. Real accounts arrive when SkillSwap gets its server.{' '}
        <Link to="/about#demo">Learn more</Link>
      </span>
    </p>
  );
}

export default function Signup() {
  useDocumentTitle('Sign up');
  const { state, signUp, startDemo } = useApp();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  if (state.signedIn && state.profile.onboarded) return <Navigate to="/me" replace />;

  const validate = (f) => {
    const e = {};
    if (f.name.trim().length < 2) e.name = 'Please enter your full name.';
    if (!EMAIL_RE.test(f.email.trim())) e.email = 'Please enter an email like name@example.com.';
    if (f.password.length < 8) e.password = 'Use at least 8 characters.';
    if (f.confirm !== f.password || !f.confirm) e.confirm = "The passwords don't match yet.";
    return e;
  };

  const set = (key) => (ev) => {
    const next = { ...form, [key]: ev.target.value };
    setForm(next);
    if (submitted) setErrors(validate(next));
  };

  const submit = (ev) => {
    ev.preventDefault();
    setSubmitted(true);
    const e = validate(form);
    setErrors(e);
    if (Object.keys(e).length) {
      document.getElementById(`su-${Object.keys(e)[0]}`)?.focus();
      return;
    }
    signUp({ name: form.name.trim(), email: form.email.trim() });
    navigate('/welcome/1');
  };

  const err = (key) =>
    errors[key] && (
      <span id={`su-${key}-err`} className="field-error">
        {errors[key]}
      </span>
    );

  return (
    <div className="auth">
      <div className="auth-form-col">
        <div className="auth-top">
          <Logo />
          <span className="small">
            Have an account? <Link to="/login">Log in</Link>
          </span>
        </div>
        <div className="auth-body">
          <div className="stack" style={{ gap: 8 }}>
            <h1 className="h1">Create your account</h1>
            <p className="muted">It's free and takes about two minutes. Next, you'll tell us what you can teach and want to learn.</p>
          </div>
          <form className="stack" onSubmit={submit} noValidate>
            <div className="field">
              <label className="field-label" htmlFor="su-name">
                Full name
              </label>
              <input id="su-name" className="input" value={form.name} onChange={set('name')} autoComplete="name" aria-invalid={!!errors.name} aria-describedby={errors.name ? 'su-name-err' : undefined} />
              {err('name')}
            </div>
            <div className="field">
              <label className="field-label" htmlFor="su-email">
                Email
              </label>
              <input id="su-email" className="input" type="email" value={form.email} onChange={set('email')} autoComplete="email" aria-invalid={!!errors.email} aria-describedby={errors.email ? 'su-email-err' : undefined} />
              {err('email')}
            </div>
            <div className="field">
              <label className="field-label" htmlFor="su-password">
                Password
              </label>
              <PasswordInput id="su-password" value={form.password} onChange={set('password')} invalid={!!errors.password} autoComplete="new-password" describedBy="su-password-hint" />
              {errors.password ? (
                err('password')
              ) : (
                <span id="su-password-hint" className="field-hint">
                  At least 8 characters.
                </span>
              )}
            </div>
            <div className="field">
              <label className="field-label" htmlFor="su-confirm">
                Confirm password
              </label>
              <PasswordInput id="su-confirm" value={form.confirm} onChange={set('confirm')} invalid={!!errors.confirm} autoComplete="new-password" describedBy={errors.confirm ? 'su-confirm-err' : undefined} />
              {err('confirm')}
            </div>
            <button type="submit" className="btn btn-primary btn-block">
              Create account
            </button>
          </form>
          <div className="or-line">or</div>
          <button
            type="button"
            className="btn btn-secondary btn-block"
            onClick={() => {
              startDemo();
              navigate('/dashboard');
            }}
          >
            Explore the demo as Sara
          </button>
          <DemoNote />
        </div>
      </div>
      <AuthAside />
    </div>
  );
}
