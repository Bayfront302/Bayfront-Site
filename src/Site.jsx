import React, { useEffect, useState } from 'react';
import './site-modern.css';
import './dark-theme.css';

// Drop-in replacement for the existing Bayfront React/Vite site.
// Image files are already in the existing repository's /public directory.
const PHOTO = {
  hero: '/New house 1.png',
  roof: '/New house 2.png',
  landscape: '/tree-with-light1.png',
  wreath: '/wreath-on-house.jpeg',
  gallery: [
    '/New house 1.png',
    '/New house 3.png',
    '/New house 4.png',
    '/house-with-light2.jpg',
    '/house-with-light2.jpg',
    '/house-with-light2.jpg',
  ],
};
const PHONE = '(830) 220-7315';
const EMAIL = 'info@bayfrontlighting.com';
const FACEBOOK = 'https://www.facebook.com/profile.php/?id=61580332635472';

function Arrow({ diagonal = false }) {
  return <span aria-hidden="true">{diagonal ? '↗' : '→'}</span>;
}

function Header() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    function closeOnEscape(e) { if (e.key === 'Escape') setOpen(false); }
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, []);
  const close = () => setOpen(false);
  return <header className="bf-header">
    <div className="bf-header__inner">
      <a className="bf-brand" href="#home" aria-label="Bayfront Lighting home" onClick={close}>
        <img className="bf-brand__logo" src="/bayfront-header-logo.svg?v=20261013-compact" alt="Bayfront Lighting" />
      </a>
      <nav className={`bf-nav${open ? ' bf-nav--open' : ''}`} aria-label="Main navigation">
        <a href="#services" onClick={close}>Our services</a>
        <a href="#gallery" onClick={close}>Gallery</a>
        <a href="#about" onClick={close}>About us</a>
        <a href="tel:+18302207315" className="bf-nav__mobile-phone" onClick={close}>Call {PHONE}</a>
      </nav>
      <a className="bf-header__cta" href="#estimate">Free estimate <Arrow diagonal /></a>
      <button className="bf-menu" type="button" aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open} onClick={() => setOpen(!open)}>
        <span></span><span></span>
      </button>
    </div>
  </header>;
}

function Hero() {
  return <section className="bf-hero" id="home" aria-labelledby="hero-title">
    <div className="bf-hero__photo" style={{ backgroundImage: `linear-gradient(90deg, rgba(4,10,12,.84) 0%, rgba(5,11,13,.62) 34%, rgba(5,11,13,.11) 76%, rgba(5,11,13,.05) 100%), linear-gradient(0deg, rgba(4,10,12,.54), rgba(4,10,12,0) 45%), url('${PHOTO.hero}')` }} role="img" aria-label="A home decorated with warm holiday lights at dusk" />
    <div className="bf-hero__content bf-container">
      <p className="bf-eyebrow bf-eyebrow--light"><span className="bf-gold-line"></span> LUXURY HOLIDAY LIGHTING · AUSTIN & THE HILL COUNTRY</p>
      <h1 id="hero-title">Make the season<br /><em>extraordinary.</em></h1>
      <p className="bf-hero__intro">Beautifully designed Christmas lighting for homes across Lake Travis and the Texas Hill Country. We handle installation, in-season service, and removal. You enjoy the glow.</p>
      <div className="bf-hero__actions">
        <a className="bf-button bf-button--cream" href="#estimate">Get my free estimate <Arrow diagonal /></a>
        <a className="bf-hero__textlink" href="#gallery">Explore the gallery <Arrow /></a>
      </div>
      <div className="bf-hero__reassurance" aria-label="Why choose Bayfront"><span>Local Hill Country team</span><span>Insured installations</span><span>Full-service holiday lighting</span></div>
    </div>
    <div className="bf-hero__foot bf-container">
      <span>THE ART OF HOLIDAY LIGHTING</span>
      <span>LAKE TRAVIS &nbsp; / &nbsp; WEST AUSTIN &nbsp; / &nbsp; TEXAS HILL COUNTRY</span>
      <a href="#services" aria-label="Scroll to our services">SCROLL TO EXPLORE <span aria-hidden="true">↓</span></a>
    </div>
  </section>;
}

function ConfidenceStrip() {
  return <section className="bf-confidence" aria-label="What is included"><div className="bf-container bf-confidence__inner">
    <p><span aria-hidden="true">✳</span> Custom design & installation</p>
    <p><span aria-hidden="true">✳</span> In-season service included</p>
    <p><span aria-hidden="true">✳</span> End-of-season removal</p>
  </div></section>;
}

const services = [
  { number: '01', name: 'Roofline lighting', image: PHOTO.roof, detail: 'Architectural lines brought to life with crisp, premium C9 lights.' },
  { number: '02', name: 'Trees & landscape', image: PHOTO.landscape, detail: 'Beautifully wrapped trees, shrubs, and outdoor features.' },
  { number: '03', name: 'Wreaths & accents', image: PHOTO.wreath, detail: 'Elegant finishing touches, thoughtfully placed for your home.' },
];
function Services() {
  return <section className="bf-services" id="services" aria-labelledby="services-title">
    <div className="bf-container">
      <div className="bf-section-intro">
        <p className="bf-eyebrow">01 / WHAT WE DO</p>
        <div className="bf-section-intro__body">
          <h2 id="services-title">A stunning home. <em>Beautifully lit.</em></h2>
          <p>Rooflines, trees, and festive finishing touches—designed to fit your home.</p>
        </div>
      </div>
      <div className="bf-service-grid">
        {services.map(s => <article className="bf-service" key={s.number}>
          <div className="bf-service__image"><img src={s.image} alt={s.name} loading="lazy" /></div>
          <div className="bf-service__meta"><span>{s.number} / SERVICE</span><span aria-hidden="true">↗</span></div>
          <h3>{s.name}</h3><p>{s.detail}</p>
        </article>)}
      </div>
    </div>
  </section>;
}

function Statement() {
  return <section className="bf-statement" id="about">
    <div className="bf-container bf-statement__inner">
      <div><p className="bf-eyebrow bf-eyebrow--light">THE BAYFRONT EXPERIENCE</p></div>
      <div>
        <h2>All the magic.<br /><em>None of the hassle.</em></h2>
        <p>We handle the design, installation, in-season service, and removal. All you have to do is enjoy the glow.</p>
        <a href="#estimate" className="bf-inline-link">Let's light up your home <Arrow diagonal /></a>
      </div>
    </div>
  </section>;
}

function Gallery() {
  return <section className="bf-gallery" id="gallery" aria-labelledby="gallery-title">
    <div className="bf-container">
      <div className="bf-gallery__top"><div><p className="bf-eyebrow">02 / LIGHTING INSPIRATION</p><h2 id="gallery-title">Make an entrance. <em>Every season.</em></h2></div><p>Imagining what your home could become.</p></div>
      <div className="bf-gallery__grid">
        {PHOTO.gallery.slice(0,4).map((src, i) => <figure key={src} className={`bf-gallery__item bf-gallery__item--${i+1}`}><img src={src} alt={`Holiday lighting inspiration ${i+1}`} loading="lazy" /><figcaption>HOLIDAY INSPIRATION <span>0{i+1}</span></figcaption></figure>)}
      </div>
    </div>
  </section>;
}

function Process() {
  const items = [
    { num:'01', title:'Tell us your vision', copy:'Tell us where you live and how to reach you.' },
    { num:'02', title:'We create your plan', copy:'We discuss the display you want and prepare your quote.' },
    { num:'03', title:'Enjoy the glow', copy:'We install, maintain, and remove your lights.' },
  ];
  return <section className="bf-process">
    <div className="bf-container"><p className="bf-eyebrow">03 / HOW IT WORKS</p><h2>Simple from <em>start to sparkle.</em></h2>
    <div className="bf-process__grid">{items.map(item => <div key={item.num} className="bf-process__item"><span>{item.num}</span><h3>{item.title}</h3><p>{item.copy}</p></div>)}</div></div>
  </section>;
}

function ReferralAndFAQ() {
  const faqs = [
    { question: 'What does holiday lighting cost?', answer: 'Pricing depends on the size of your property and your lighting plan. Request a free estimate for a quote tailored to your home.' },
    { question: 'Do you provide the lights?', answer: 'Yes. Our designs use professional holiday lighting materials, including premium C9 roofline bulbs.' },
    { question: 'What if a light goes out during the season?', answer: 'In-season service is included. Contact us and we’ll help make it right.' },
    { question: 'Do you handle removal?', answer: 'Yes. End-of-season removal is part of our lighting service.' },
  ];
  return <section className="bf-faq" aria-labelledby="faq-title">
    <div className="bf-container">
      <div className="bf-referral"><div><p className="bf-eyebrow">A LITTLE EXTRA HOLIDAY CHEER</p><h2>Good neighbors. <em>Better holidays.</em></h2><p>Refer a neighbor and you both save 15% when both projects are booked this season.</p><p className="bf-referral__terms">Residential installs only. One discount per household. Referral must be within our service area.</p></div><a className="bf-button bf-button--dark" href="#estimate">Ask about the offer <Arrow diagonal /></a></div>
      <div className="bf-faq__layout"><div><p className="bf-eyebrow">04 / GOOD TO KNOW</p><h2 id="faq-title">A few good <em>questions.</em></h2></div><div className="bf-faq__items">{faqs.map(item => <details key={item.question}><summary>{item.question}<span aria-hidden="true">+</span></summary><p>{item.answer}</p></details>)}</div></div>
    </div>
  </section>;
}

function EstimateForm() {
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');
  async function submit(e) {
    e.preventDefault();
    if (status === 'sending') return;
    const data = new FormData(e.currentTarget);
    const encoded = new URLSearchParams();
    encoded.set('form-name', 'estimate');
    for (const [key,value] of data.entries()) encoded.set(key, String(value));
    setStatus('sending'); setError('');
    try {
      const result = await fetch('/', { method:'POST', headers:{'Content-Type':'application/x-www-form-urlencoded'}, body:encoded.toString() });
      if (!result.ok) throw new Error(`HTTP ${result.status}`);
      if (typeof window.gtag === 'function') window.gtag('event', 'conversion', { send_to:'AW-17611390609/ID3QCPyJmqQbEJH94c1B', value:1.0, currency:'USD' });
      setStatus('sent');
    } catch {
      setStatus('idle'); setError('We couldn’t send your request. Please try again or call us directly.');
    }
  }
  return <section className="bf-estimate" id="estimate" aria-labelledby="estimate-title">
    <div className="bf-container bf-estimate__grid">
      <div className="bf-estimate__copy"><p className="bf-eyebrow bf-eyebrow--light">LET'S MAKE SOMETHING BEAUTIFUL</p>
        <h2 id="estimate-title">Your brightest<br /><em>season starts here.</em></h2>
        <p>It only takes a moment. Share your contact details and we’ll follow up about your free, no-obligation quote.</p>
        <div className="bf-estimate__contacts"><a href="tel:+18302207315">{PHONE} <Arrow diagonal /></a><a href={`mailto:${EMAIL}`}>{EMAIL} <Arrow diagonal /></a></div>
        <span className="bf-estimate__location">PROUDLY SERVING THE TEXAS HILL COUNTRY</span>
      </div>
      {status === 'sent' ? <div className="bf-estimate__success" role="status"><span aria-hidden="true">✳</span><h3>Thank you!</h3><p>Your estimate request has been submitted. We’ll be in touch soon.</p><a href="tel:+18302207315">Need us sooner? Call {PHONE}</a></div>
      : <form className="bf-form" name="estimate" method="POST" data-netlify="true" netlify-honeypot="bot-field" onSubmit={submit}>
          <input type="hidden" name="form-name" value="estimate" />
          <p className="bf-honeypot"><label>Leave blank: <input name="bot-field" tabIndex="-1" autoComplete="off" /></label></p>
          <p className="bf-form__intro">GET YOUR FREE, NO-OBLIGATION QUOTE <span>About 30 seconds</span></p>
          <label>YOUR NAME <input name="name" required placeholder="Full name" autoComplete="name" /></label>
          <label>PHONE NUMBER <input name="phone" type="tel" inputMode="tel" required placeholder="(830) 000-0000" autoComplete="tel" /></label>
          <label>CITY OR PROPERTY ZIP CODE <input name="address" required placeholder="Marble Falls, TX" autoComplete="address-level2" /></label>
          <details className="bf-form__optional"><summary>Want to add an email or project details? <span aria-hidden="true">+</span></summary>
            <label>EMAIL (OPTIONAL) <input name="email" type="email" placeholder="you@example.com" autoComplete="email" /></label>
            <label>LIGHTING PLANS (OPTIONAL) <select name="service" defaultValue=""><option value="">Not sure yet</option><option>Roofline lighting</option><option>Trees & landscape</option><option>Wreaths & accents</option><option>Full-property design</option></select></label>
            <label>ANYTHING ELSE? (OPTIONAL) <textarea name="notes" rows="3" placeholder="Roofline, trees, color ideas..." /></label>
          </details>
          {error && <p className="bf-form__error" role="alert">{error}</p>}
          <button className="bf-button bf-button--dark" type="submit" disabled={status==='sending'}>{status==='sending' ? 'Sending your request…' : 'Request my free estimate'} <Arrow diagonal /></button>
          <p className="bf-form__fineprint">No obligation. We only use your details to respond about your estimate.</p>
        </form>}
    </div>
  </section>;
}

function Footer() {
  return <footer className="bf-footer"><div className="bf-container">
    <div className="bf-footer__row"><a className="bf-brand bf-brand--footer" href="#home"><span className="bf-brand__main">BAYFRONT<span className="bf-brand__star">✳</span></span><span className="bf-brand__sub">LIGHTING</span></a><div className="bf-footer__links"><a href="#services">Services</a><a href="#gallery">Gallery</a><a href="#estimate">Free estimate</a><a href={FACEBOOK} target="_blank" rel="noopener noreferrer">Facebook ↗</a></div></div>
    <div className="bf-footer__bottom"><span>© {new Date().getFullYear()} BAYFRONT LIGHTING. ALL RIGHTS RESERVED.</span><span>HOLIDAY ILLUMINATION SPECIALISTS · TEXAS HILL COUNTRY</span></div>
  </div></footer>;
}

export default function Site() {
  useEffect(() => {
    if (window.location.hash === '#/gallery' || window.location.hash === '#/gallery/') {
      window.history.replaceState(null, '', '#gallery');
      requestAnimationFrame(() => document.getElementById('gallery')?.scrollIntoView());
    }
  }, []);
  return <div className="bf-site"><Header /><main><Hero /><ConfidenceStrip /><Services /><Gallery /><Statement /><Process /><EstimateForm /><ReferralAndFAQ /></main><Footer /><nav className="bf-mobile-actions" aria-label="Quick contact"><a href="tel:+18302207315" className="bf-mobile-actions__call">Call now</a><a href="#estimate" className="bf-mobile-actions__quote">Get a free estimate <Arrow diagonal /></a></nav></div>;
}
