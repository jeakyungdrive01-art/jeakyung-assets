import { flushSync } from 'react-dom';
import { createRoot } from 'react-dom/client';

import HeroSection from '../components/home/HeroSection.jsx';
import PublicFooter from '../components/layout/PublicFooter.jsx';
import PublicHeader from '../components/layout/PublicHeader.jsx';

const header = document.getElementById('header');
const hero = document.getElementById('top');
const footer = document.querySelector('.site-footer');

if (header) {
  const headerRoot = createRoot(header);
  flushSync(() => headerRoot.render(<PublicHeader page="home" />));
}

if (hero) {
  const heroRoot = createRoot(hero);
  flushSync(() => heroRoot.render(<HeroSection />));
}

if (footer) {
  const footerRoot = createRoot(footer);
  flushSync(() => footerRoot.render(<PublicFooter page="home" />));
}
