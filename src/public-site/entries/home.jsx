import { flushSync } from 'react-dom';
import { createRoot } from 'react-dom/client';

import PublicFooter from '../components/layout/PublicFooter.jsx';
import PublicHeader from '../components/layout/PublicHeader.jsx';
import HomePage from '../pages/HomePage.jsx';

const header = document.getElementById('header');
const main = document.getElementById('main-content');
const footer = document.querySelector('.site-footer');

if (header) {
  const headerRoot = createRoot(header);
  flushSync(() => headerRoot.render(<PublicHeader page="home" />));
}

if (main) {
  const mainRoot = createRoot(main);
  flushSync(() => mainRoot.render(<HomePage />));
}

if (footer) {
  const footerRoot = createRoot(footer);
  flushSync(() => footerRoot.render(<PublicFooter page="home" />));
}
