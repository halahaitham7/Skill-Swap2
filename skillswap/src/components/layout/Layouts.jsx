import { Outlet } from 'react-router-dom';
import Header from './Header.jsx';
import TabBar from './TabBar.jsx';
import Footer from './Footer.jsx';
import './Layout.css';

/** Every page shares one shell; the header adapts to signed-in vs visitor. */
export function SiteLayout() {
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <Header />
      <main id="main">
        <Outlet />
      </main>
      <Footer />
      <TabBar />
    </>
  );
}

/** Focused layout for sign up, log in and onboarding: logo only, no distractions. */
export function FocusLayout() {
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <main id="main" className="focus-main">
        <Outlet />
      </main>
    </>
  );
}
