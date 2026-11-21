import { useState } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import Logo from '../components/Logo.jsx';
import { useApp } from '../context/AppContext.jsx';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import AuthAside from './AuthAside.jsx';
import { DemoNote, PasswordInput } from './Signup.jsx';
import './Auth.css';

export default function Login() {
  useDocumentTitle('Log in');
  const { state, logIn, startDemo } = useApp();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const next = params.get('next') && params.get('next').startsWith('/') ? params.get('next') : '/dashboard';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});

  if (state.signedIn) return <Navigate to={state.profile.onboarded ? next : '/welcome/1'} replace />;

  const submit = (e) => {
    e.preventDefault();
    const errs = {};
    if (!email.trim()) errs.email = 'Please enter your email.';
    if (!password) errs.password = 'Please enter your password.';
    if (!errs.email && !errs.password && !logIn({ email })) {
      errs.email = "We couldn't find an account with that email on this device.";
    }
    setErrors(errs);
    if (!Object.keys(errs).length) navigate(state.profile.onboarded ? next : '/welcome/1');
  };

  return (
    <div className="auth">
      <div className="auth-form-col">
        <div className="auth-top">
          <Logo />
          <span className="small">
            New here? <Link to="/signup">Sign up</Link>
          </span>
        </div>
        <div className="auth-body">
          <div className="stack" style={{ gap: 8 }}>
            <h1 className="h1">Welcome back</h1>
            <p className="muted">Log in to see your matches, swaps and messages.</p>
          </div>
          <form className="stack" onSubmit={submit} noValidate>
            <div className="field">
              <label className="field-label" htmlFor="li-email">
                Email
              </label>
              <input id="li-email" className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" aria-invalid={!!errors.email} aria-describedby={errors.email ? 'li-email-err' : undefined} />
              {errors.email && (
                <span id="li-email-err" className="field-error">
                  {errors.email}
                </span>
              )}
            </div>
            <div className="field">
              <label className="field-label" htmlFor="li-password">
                Password
              </label>
              <PasswordInput id="li-password" value={password} onChange={(e) => setPassword(e.target.value)} invalid={!!errors.password} autoComplete="current-password" describedBy={errors.password ? 'li-password-err' : undefined} />
              {errors.password && (
                <span id="li-password-err" className="field-error">
                  {errors.password}
                </span>
              )}
            </div>
            <button type="submit" className="btn btn-primary btn-block">
              Log in
            </button>
          </form>
          {state.account && (
            <p className="small muted">
              Account on this device: <strong style={{ color: 'var(--teal)' }}>{state.account.email}</strong>
            </p>
          )}
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
