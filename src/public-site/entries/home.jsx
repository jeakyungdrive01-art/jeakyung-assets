import { flushSync } from 'react-dom';
import { createRoot } from 'react-dom/client';

import CeoGreeting from '../components/home/CeoGreeting.jsx';
import CompanyOverview from '../components/home/CompanyOverview.jsx';
import CoreValues from '../components/home/CoreValues.jsx';
import HeroSection from '../components/home/HeroSection.jsx';
import LocationSection from '../components/home/LocationSection.jsx';
import ServicesSection from '../components/home/ServicesSection.jsx';
import PublicFooter from '../components/layout/PublicFooter.jsx';
import PublicHeader from '../components/layout/PublicHeader.jsx';

const header = document.getElementById('header');
const hero = document.getElementById('top');
const ceoGreeting = document.querySelector('#about > .content-width > .ceo-greeting');
const companyOverview = document.querySelector('#about > .content-width > .company-heading');
const coreValues = document.querySelector('#about > .content-width > .value-grid');
const location = document.getElementById('location');
const services = document.getElementById('services');
const footer = document.querySelector('.site-footer');

if (header) {
  const headerRoot = createRoot(header);
  flushSync(() => headerRoot.render(<PublicHeader page="home" />));
}

if (hero) {
  const heroRoot = createRoot(hero);
  flushSync(() => heroRoot.render(<HeroSection />));
}

if (ceoGreeting) {
  const ceoGreetingRoot = createRoot(ceoGreeting);
  flushSync(() => ceoGreetingRoot.render(<CeoGreeting />));
}

if (companyOverview) {
  const companyOverviewRoot = createRoot(companyOverview);
  flushSync(() => companyOverviewRoot.render(<CompanyOverview />));
}

if (coreValues) {
  const coreValuesRoot = createRoot(coreValues);
  flushSync(() => coreValuesRoot.render(<CoreValues />));
}

if (location) {
  const locationRoot = createRoot(location);
  flushSync(() => locationRoot.render(<LocationSection />));
}

if (services) {
  const servicesRoot = createRoot(services);
  flushSync(() => servicesRoot.render(<ServicesSection />));
}

if (footer) {
  const footerRoot = createRoot(footer);
  flushSync(() => footerRoot.render(<PublicFooter page="home" />));
}
