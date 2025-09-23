// src/Site.jsx
import React, { useState, useEffect, createContext, useContext } from "react"; 

// -----------------------------------------------------------------------------
// Theme tokens (dark, slate + amber)
// -----------------------------------------------------------------------------
const TOKENS = {
  mainBg: 'bg-gray-900',
  sectionBg: 'bg-gray-800',
  cardBg: 'bg-gray-900',
  border: 'border-gray-700',
  text: 'text-white',
  muted: 'text-gray-300',
  accentBg: 'bg-amber-400',
  accentTextOn: 'text-gray-900',
  accentRing: 'ring-amber-400',
  heading: 'font-serif',
};

// -----------------------------------------------------------------------------
// Fonts (Inter for body, Merriweather for headings/logo)
// -----------------------------------------------------------------------------
const fontCss = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=Merriweather:wght@700;900&display=swap');
body { font-family: 'Inter', system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; }
.font-serif { font-family: 'Merriweather', Georgia, Cambria, 'Times New Roman', Times, serif; }
`;
if (typeof document !== 'undefined' && !document.getElementById('bayfront-fonts')) {
  const style = document.createElement('style');
  style.id = 'bayfront-fonts';
  style.innerHTML = fontCss;
  document.head.appendChild(style);
}

// -----------------------------------------------------------------------------
// Constants (avoid stray/unterminated strings)
// -----------------------------------------------------------------------------
const FB_URL = 'https://www.facebook.com/bayfrontlighting';
const RUSH_START = 'December 1st';
const CUTOFF_DATE = 'December 10th';

// -----------------------------------------------------------------------------
// Context & helpers
// -----------------------------------------------------------------------------
const ThemeCtx = createContext({ tokens: TOKENS });
const useTheme = () => useContext(ThemeCtx);

// Encode and harden image paths
function encodePaths(files) {
  const out = [];
  const seen = new Set();
  for (const f of files || []) {
    if (typeof f !== 'string') continue;
    const trimmed = f.trim();
    if (!trimmed) continue;
    const key = trimmed.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    const looksAbsolute =
      /^\//.test(trimmed) || /^https?:/i.test(trimmed) || trimmed.startsWith('data:');
    const withPrefix = looksAbsolute ? trimmed : ('/' + trimmed);
    out.push(encodeURI(withPrefix));
  }
  return out;
}

// 1x1 PNG fallback
const BLANK_IMG = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIW2NkYGD4DwABNQEA3zV8KQAAAABJRU5ErkJggg==';
function computeSlides(list) {
  const enc = encodePaths(list);
  return enc.length > 0 ? enc : [BLANK_IMG];
}

function isGallery(hash) { return typeof hash === 'string' && hash.startsWith('#/gallery'); }

function useRoute() {
  const initial = (typeof window !== 'undefined' && window.location) ? (window.location.hash || '#/') : '#/';
  const [route, setRoute] = useState(initial);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const onHash = () => setRoute(window.location.hash || '#/');
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);
  return route;
}

// -----------------------------------------------------------------------------
// HeaderBar
// -----------------------------------------------------------------------------
function HeaderBar() {
  const { tokens } = useTheme();
  const [open, setOpen] = useState(false);
  const route = useRoute();
  const inGallery = isGallery(route);
  return (
    <header className={`sticky top-0 z-50 border-b ${tokens.border} ${TOKENS.cardBg}`}>
      <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
        <a href="#/" className="flex flex-col items-center text-center">
          <span className={`text-4xl ${tokens.heading} text-amber-400 drop-shadow`}>Bayfront Lighting</span>
          <hr className="border-t border-gray-600 w-full my-1" />
          <span className={`text-base ${tokens.muted} ${tokens.heading}`}>Holiday Illumination Specialists</span>
        </a>
        <nav className={`hidden md:flex items-center gap-6 ${tokens.muted}`}>
          {!inGallery && (<>
            <a href="#offerings" className="hover:opacity-90">What We Offer</a>
            <a href="#estimate" className="hover:opacity-90">Free Estimate</a>
            <a href="#about" className="hover:opacity-90">About</a>
          </>)}
          <a href="#/gallery" className="hover:opacity-90">Gallery</a>
        </nav>
        <button className="md:hidden rounded-md px-3 py-2 ring-1 ring-gray-600 hover:bg-gray-700" onClick={()=>setOpen(o=>!o)} aria-label="Toggle menu">
          ☰
        </button>
      </div>
      {open && (
        <div className={`md:hidden border-t ${tokens.border}`}>
          <div className={`px-6 py-4 flex flex-col gap-3 ${tokens.muted}`}>
            {!inGallery && (<>
              <a href="#offerings" onClick={()=>setOpen(false)}>What We Offer</a>
              <a href="#estimate" onClick={()=>setOpen(false)}>Free Estimate</a>
              <a href="#about" onClick={()=>setOpen(false)}>About</a>
            </>)}
            <a href="#/gallery" onClick={()=>setOpen(false)}>Gallery</a>
          </div>
        </div>
      )}
    </header>
  );
}

// -----------------------------------------------------------------------------
// Hero (manual/auto slideshow with safe fallbacks)
// -----------------------------------------------------------------------------
function Hero() {
  const slideFiles = [
    'wreath-on-house.jpeg',
    'house-with-light7.jpeg',
    'bush-with-light2.jpeg',
    'bush-with-light1.jpeg',
  ];
  const slides = computeSlides(slideFiles);
  const [i, setI] = useState(0);
  const many = slides.length > 1;
  useEffect(()=>{
    if (!many) return; // only auto-cycle with 2+ slides
    const id = setInterval(()=> setI(v => (v+1)%slides.length), 5000);
    return ()=>clearInterval(id);
  },[many, slides.length]);
  const next=()=> many && setI(v => (v+1)%slides.length);
  const prev=()=> many && setI(v => (v-1+slides.length)%slides.length);
  return (
    <section className={`relative h:[70vh] md:h:[80vh] w-full flex items-center justify-center text-center px-6 ${TOKENS.sectionBg} overflow-hidden`}>
      <div className="absolute inset-0 -z-10">
        {slides.map((src, idx) => (
          <img
            key={src+idx}
            src={src}
            alt="Bayfront Lighting background"
            onError={(e)=>{ e.currentTarget.onerror=null; e.currentTarget.src = BLANK_IMG; e.currentTarget.classList.add('opacity-0'); }}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${i===idx?'opacity-100':'opacity-0'}`}
          />
        ))}
        <div className="absolute inset-0 bg-black/55" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/70 to-transparent" />
      </div>
      {many && (
        <>
          <button aria-label="Prev" onClick={prev} className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/90 text-gray-900">‹</button>
          <button aria-label="Next" onClick={next} className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/90 text-gray-900">›</button>
        </>
      )}
      <div>
        <h1 className={`text-white text-4xl md:text-6xl font-bold leading-tight ${TOKENS.heading}`}>
          <span className="text-red-400">Holiday</span> <span className="text-green-400">lighting</span> without the hassle
        </h1>
        <p className={`mt-4 ${TOKENS.muted} text-lg md:text-xl`}>
          Design, installation, in-season service, and end-of-season removal — we store your lights free.
        </p>
        <div className="mt-8 flex flex-wrap gap-4 justify-center">
          <a href="#estimate" className={`rounded-md ${TOKENS.accentBg} ${TOKENS.accentTextOn} font-semibold px-6 py-4 shadow hover:opacity-90 text-lg`}>Request Free Estimate</a>
        </div>
      </div>
    </section>
  );
}

// -----------------------------------------------------------------------------
// Offerings
// -----------------------------------------------------------------------------
function Offerings(){
  return (
    <section id="offerings" className="mx-auto max-w-7xl px-6 py-16">
      <div className="text-center">
        <h2 className={`${TOKENS.heading} text-4xl md:text-5xl font-bold text-white mt-2`}>What We Offer</h2>
        <p className={`mt-3 ${TOKENS.muted} max-w-2xl mx-auto text-lg`}>Design • Install • Service • Removal</p>
      </div>
      <div className="mt-10 grid md:grid-cols-2 lg:grid-cols-4 gap-8">
        <OfferCard title="Design" text="Tailored plans for rooflines, trees, shrubs, and walkways." />
        <OfferCard title="Installation" text="Premium LEDs, pro clips, tidy cable routing." />
        <OfferCard title="In-season service" text="If something fails, we fix it fast — guaranteed." />
        <OfferCard title="Removal & storage" text="We remove and store at season's end for no extra charge." />
      </div>
    </section>
  );
}
function OfferCard({title, text}){
  return (
    <div className={`rounded-xl p-6 shadow-sm ring-1 ${TOKENS.accentRing} ${TOKENS.cardBg}`}>
      <div className={`text-base uppercase tracking-wide ${TOKENS.muted}`}>{title}</div>
      <p className={`mt-3 text-base md:text-lg text-amber-400`}>{text}</p>
    </div>
  );
}

// -----------------------------------------------------------------------------
// CTA (Estimate form)
// -----------------------------------------------------------------------------
function CTA(){
  return (
    <section id="estimate" className={`border-t ${TOKENS.border} ${TOKENS.sectionBg} text-lg`}>
      <div className="mx-auto max-w-7xl px-6 py-16 grid md:grid-cols-2 gap-12 items-start">
        <div>
          <div className="text-center md:text-left">
            <div className={`text-sm uppercase tracking-[.22em] ${TOKENS.muted}`}>Free estimate</div>
            <h2 className={`${TOKENS.heading} text-3xl md:text-4xl font-bold text-white mt-2`}>Tell us about your property</h2>
            <p className={`mt-3 ${TOKENS.muted} max-w-xl`}>We'll respond within one business day with next steps.</p>
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-2 rounded-full bg-gray-900/60 ring-1 ring-white/10 px-3 py-1 text-sm"><span>✅</span>Fully Insured</span>
              <span className="inline-fl
