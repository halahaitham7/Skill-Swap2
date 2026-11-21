import { Navigate, Route, Routes, useLocation, useSearchParams } from 'react-router-dom';
import { FocusLayout, SiteLayout } from './components/layout/Layouts.jsx';
import RequireAuth from './components/RequireAuth.jsx';
import ScrollToTop from './components/ScrollToTop.jsx';
import Toasts from './components/Toasts.jsx';
import Home from './pages/Home.jsx';
import HowItWorks from './pages/HowItWorks.jsx';
import About from './pages/About.jsx';
import Signup from './pages/Signup.jsx';
import Login from './pages/Login.jsx';
import Onboarding from './pages/Onboarding.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Explore from './pages/Explore.jsx';
import Profile from './pages/Profile.jsx';
import Swaps from './pages/Swaps.jsx';
import SwapDetail from './pages/SwapDetail.jsx';
import Messages from './pages/Messages.jsx';
import MyProfile from './pages/MyProfile.jsx';
import Community from './pages/Community.jsx';
import NotFound from './pages/NotFound.jsx';

/** Old /match links keep working and keep their filters. */
function MatchRedirect() {
  const { search } = useLocation();
  return <Navigate to={`/explore${search}`} replace />;
}

/** Sessions now live inside each swap. */
function SessionsRedirect() {
  const [params] = useSearchParams();
  const partner = params.get('with');
  return <Navigate to={partner ? `/swaps/${partner}` : '/swaps'} replace />;
}

const guard = (el) => <RequireAuth>{el}</RequireAuth>;

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route element={<FocusLayout />}>
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/welcome/:step"
            element={
              <RequireAuth allowIncomplete>
                <Onboarding />
              </RequireAuth>
            }
          />
          <Route path="/welcome" element={<Navigate to="/welcome/1" replace />} />
        </Route>

        <Route element={<SiteLayout />}>
          {/* Public */}
          <Route path="/" element={<Home />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/about" element={<About />} />
          <Route path="/profile/:userId" element={<Profile />} />
          <Route path="/community" element={<Community />} />

          {/* Signed in */}
          <Route path="/dashboard" element={guard(<Dashboard />)} />
          <Route path="/swaps" element={guard(<Swaps />)} />
          <Route path="/swaps/:userId" element={guard(<SwapDetail />)} />
          <Route path="/messages" element={guard(<Messages />)} />
          <Route path="/messages/:userId" element={guard(<Messages />)} />
          <Route path="/me" element={guard(<MyProfile />)} />

          {/* Old routes */}
          <Route path="/match" element={<MatchRedirect />} />
          <Route path="/sessions" element={<SessionsRedirect />} />

          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
      <Toasts />
    </>
  );
}
