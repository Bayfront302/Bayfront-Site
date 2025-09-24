import React, { useState, useEffect, createContext, useContext } from "react";
import lightsUrl from "./assets/lights-divider.svg?url"; // 🎄 divider image

// -----------------------------------------------------------------------------
// Theme tokens (dark, slate + amber)
// -----------------------------------------------------------------------------
const TOKENS = {
  mainBg: "bg-gray-900",
  sectionBg: "bg-gray-800",
  cardBg: "bg-gray-900",
  border: "border-gray-700",
  text: "text-white",
  muted: "text-gray-300",
  accentBg: "bg-amber-400",
  accentTextOn: "text-gray-900",
  accentRing: "ring-amber-400",
  heading: "font-serif",
};

// -----------------------------------------------------------------------------
// Fonts (Inter for body, Merriweather for headings/logo) – inject once
// -----------------------------------------------------------------------------
const fontCss = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=Merriweather:wght@700;900&display=swap');
body { font-family: 'Inter', system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; }
.font-serif { font-family: 'Merriweather', Georgia, Cambria, 'Times New Roman', Times, serif; }
`;
if (typeof document !== "undefined" && !document.getElementById("bayfront-fonts")) {
  const style = document.createElement("style");
  style.id = "bayfront-fonts";
  style.innerHTML = fontCss;
  document.head.appendChild(style);
}

// -----------------------------------------------------------------------------
// Constants
// -----------------------------------------------------------------------------
const FB_URL = "https://www.facebook.com/bayfrontlighting";
const RUSH_START = "December 1st";
const CUTOFF_DATE = "December 10th";
const EMAIL = "info@bayfrontlighting"; // per your request

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
    if (typeof f !== "string") continue;
    const trimmed = f.trim();
    if (!trimmed) continue;
    const key = trimmed.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    const looksAbsolute =
      /^\//.test(trimmed) || /^https?:/i.test(trimmed) || trimmed.startsWith("data:");
    const withPrefix = looksAbsolute ? trimmed : "/" + trimmed;
    out.push(encodeURI(withPrefix));
  }
  return out;
}

const BLANK_IMG =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIW2NkYGD4DwABNQEA3zV8KQAAAABJRU5ErkJggg==";

function computeSlides(list) {
  const enc = encodePaths(list);
  return enc.length > 0 ? enc : [BLANK_IMG];
}

function isGallery(hash) {
  return typeof hash === "string" && hash.startsWith("#/gallery");
}

function useRoute() {
  const initial =
    typeof window !== "undefined" && window.location
      ? window.location.hash || "#/"
      : "#/";
  const [route, setRoute] = useState(initial);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const onHash = () => setRoute(window.location.hash || "#/");
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
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
    <>
      <header className={`sticky top-0 z-50 border-b ${tokens.border} ${TOKENS.cardBg}`}>
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
          <a href="#/" className="flex flex-col items-center text-center">
            <span className={`text-4xl ${tokens.heading} text-amber-400 drop-shadow`}>Bayfront Lighting</span>
            <hr className="border-t border-gray-600 w-full my-1" />
            <span className={`text-base ${tokens.muted} ${tokens.heading}`}>Holiday Illumination Specialists</span>
          </a>

          <nav className={`hidden md:flex items-center gap-6 ${tokens.muted}`}>
            {!inGallery && (
              <>
                <a href="#offerings" className="hover:opacity-90">What We Offer</a>
                <a href="#estimate" className="hover:opacity-90">Free Estimate</a>
                <a href="#about" className="hover:opacity-90">About</a>
              </>
            )}
            <a href="#/gallery" className="hover:opacity-90">Gallery</a>
          </nav>

          <button
            className="md:hidden rounded-md px-3 py-2 ring-1 ring-gray-600 hover:bg-gray-700"
            onClick={() => setOpen(o => !o)}
            aria-label="Toggle menu"
          >
            ☰
          </button>
        </div>

        {open && (
          <div className={`md:hidden border-t ${tokens.border}`}>
            <div className={`px-6 py-4 flex flex-col gap-3 ${tokens.muted}`}>
              {!inGallery && (
                <>
                  <a href="#offerings" onClick={()=>setOpen(false)}>What We Offer</a>
                  <a href="#estimate" onClick={()=>setOpen(false)}>Free Estimate</a>
                  <a href="#about" onClick={()=>setOpen(false)}>About</a>
                </>
              )}
              <a href="#/gallery" onClick={()=>setOpen(false)}>Gallery</a>
            </div>
          </div>
        )}
      </header>

    {/* 🎄 Animated lights divider */}
<div className="w-full bg-gray-900 py-3">
  <div className="lights-strip">
    <span className="bulb red"></span>
    <span className="bulb green"></span>
    <span className="bulb yellow"></span>
    <span className="bulb blue"></span>
    <span className="bulb red"></span>
    <span className="bulb green"></span>
    <span className="bulb yellow"></span>
    <span className="bulb blue"></span>
    <span className="bulb red"></span>
    <span className="bulb green"></span>
    <span className="bulb yellow"></span>
    <span className="bulb blue"></span>
  </div>
</div>
    </>
  );
}

// -----------------------------------------------------------------------------
// Hero (fixed z-index so slides are visible)
// -----------------------------------------------------------------------------
function Hero() {
  const slideFiles = [
    "wreath-on-house.jpeg",
    "house-with-light7.jpeg",
    "house-with-light2.jpg",
    "house-with-light1.jpeg",
  ];
  const slides = computeSlides(slideFiles);
  const [i, setI] = useState(0);
  const many = slides.length > 1;

  useEffect(() => {
    if (!many) return;
    const id = setInterval(() => setI((v) => (v + 1) % slides.length), 5000);
    return () => clearInterval(id);
  }, [many, slides.length]);

  const next = () => many && setI((v) => (v + 1) % slides.length);
  const prev = () => many && setI((v) => (v - 1 + slides.length) % slides.length);

  return (
    <section
      className={`relative h-[70vh] md:h-[80vh] w-full flex items-center justify-center text-center px-6 overflow-hidden`} // removed ${TOKENS.sectionBg}
    >
      {/* Slide layer */}
      <div className="absolute inset-0 z-0">
        {slides.map((src, idx) => (
          <img
            key={src + idx}
            src={src}
            alt="Bayfront Lighting background"
            loading={idx === 0 ? "eager" : "lazy"}
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = BLANK_IMG;
              e.currentTarget.classList.add("opacity-0");
            }}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
              i === idx ? "opacity-100" : "opacity-0"
            }`}
          />
        ))}
      </div>

      {/* Overlays above images */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        <div className="absolute inset-0 bg-black/55" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/70 to-transparent" />
      </div>

      {/* Controls */}
      {many && (
        <>
          <button
            aria-label="Prev"
            onClick={prev}
            className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/90 text-gray-900 z-20"
          >
            ‹
          </button>
          <button
            aria-label="Next"
            onClick={next}
            className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/90 text-gray-900 z-20"
          >
            ›
          </button>
        </>
      )}

      {/* Text content */}
      <div className="relative z-20">
        <h1 className={`text-white text-4xl md:text-6xl font-bold leading-tight ${TOKENS.heading}`}>
          <span className="text-red-400">Holiday</span>{" "}
          <span className="text-green-400">lighting</span> without the hassle
        </h1>
        <p className={`mt-4 ${TOKENS.muted} text-lg md:text-xl`}>
          Design, installation, in-season service, and end-of-season removal — we store your lights free.
        </p>
      </div>
    </section>
  );
}

// -----------------------------------------------------------------------------
// Offerings
// -----------------------------------------------------------------------------
function Offerings() {
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
function OfferCard({ title, text }) {
  return (
    <div className={`rounded-xl p-6 shadow-sm ring-1 ${TOKENS.accentRing} ${TOKENS.cardBg}`}>
      <div className={`text-base uppercase tracking-wide ${TOKENS.muted}`}>{title}</div>
      <p className={`mt-3 text-base md:text-lg text-amber-400`}>{text}</p>
    </div>
  );
}

// -----------------------------------------------------------------------------
// CTA (Estimate) — Netlify Forms enabled (with Phone + Notes + placeholders)
// -----------------------------------------------------------------------------
function CTA() {
  return (
    <section id="estimate" className={`border-t ${TOKENS.border} ${TOKENS.sectionBg} text-lg`}>
      <div className="mx-auto max-w-7xl px-6 py-16 grid md:grid-cols-2 gap-12 items-start">
        {/* Left column: heading, badges, cutoff note, and BIG circle logo */}
        <div>
          <div className="text-center md:text-left">
            <div className={`text-sm uppercase tracking-[.22em] ${TOKENS.muted}`}>Free estimate</div>
            <h2 className={`${TOKENS.heading} text-3xl md:text-4xl font-bold text-white mt-2`}>
              Tell us about your property
            </h2>
            <p className={`mt-3 ${TOKENS.muted} max-w-xl`}>
              We'll respond within one business day with next steps.
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-2 rounded-full bg-gray-900/60 ring-1 ring-white/10 px-3 py-1 text-sm">
                <span>✅</span>Fully Insured
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-gray-900/60 ring-1 ring-white/10 px-3 py-1 text-sm">
                <span>⚡</span>Rush installs start {RUSH_START}
              </span>
            </div>
          </div>

          <p className={`mt-4 ${TOKENS.muted} text-sm`}>
            Cutoff for guaranteed installation is {CUTOFF_DATE}.
          </p>

          {/* 🔵 Big circular logo to fill space */}
          <div className="mt-8 flex justify-center md:justify-start">
            <div className="rounded-full overflow-hidden w-64 h-64 md:w-80 md:h-80 lg:w-96 lg:h-96 ring-2 ring-amber-400 shadow-lg shadow-black/40 bg-gray-900">
              <img
                src="/bayfront-logo.jpg"  /* <-- put your file in /public as this name */
                alt="Bayfront Lighting logo"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>

        {/* Right column: Netlify form */}
        <form
          name="estimate"
          method="POST"
          action="/thanks.html"
          data-netlify="true"
          data-netlify-honeypot="bot-field"
          className="bg-gray-900/60 rounded-xl p-6 ring-1 ring-white/10 space-y-4"
        >
          <input type="hidden" name="form-name" value="estimate" />
          <p className="hidden">
            <label>Don’t fill this out: <input name="bot-field" /></label>
          </p>

          <div>
            <label className="block text-sm text-gray-300 mb-1">Name</label>
            <input
              name="name"
              required
              placeholder="John Smith"
              className="w-full rounded-md bg-gray-800 border border-gray-700 px-3 py-2 text-white"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-1">Email</label>
            <input
              name="email"
              type="email"
              required
              placeholder="you@example.com"
              className="w-full rounded-md bg-gray-800 border border-gray-700 px-3 py-2 text-white"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-1">Phone (optional)</label>
            <input
              name="phone"
              type="tel"
              placeholder="(123) 456-7890"
              className="w-full rounded-md bg-gray-800 border border-gray-700 px-3 py-2 text-white"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-1">Address / Area</label>
            <input
              name="address"
              placeholder="123 Main St, Hill Country"
              className="w-full rounded-md bg-gray-800 border border-gray-700 px-3 py-2 text-white"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-1">Details</label>
            <textarea
              name="details"
              rows="3"
              placeholder="Two-story house, about 60ft of roofline"
              className="w-full rounded-md bg-gray-800 border border-gray-700 px-3 py-2 text-white"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-1">Notes</label>
            <textarea
              name="notes"
              rows="3"
              placeholder="Any special requests, color preferences, trees or shrubs to include..."
              className="w-full rounded-md bg-gray-800 border border-gray-700 px-3 py-2 text-white"
            />
          </div>

          <button
            type="submit"
            className={`w-full rounded-md ${TOKENS.accentBg} ${TOKENS.accentTextOn} font-semibold px-4 py-3`}
          >
            Get My Free Estimate
          </button>
        </form>
      </div>
    </section>
  );
}

// -----------------------------------------------------------------------------
// About + Footer (About shows email + FB on right)
// -----------------------------------------------------------------------------
function About() {
  return (
    <section id="about" className="mx-auto max-w-7xl px-6 py-16">
      <div className="grid md:grid-cols-2 gap-8 items-start">
        {/* Left: About text */}
        <div>
          <h2 className={`${TOKENS.heading} text-3xl md:text-4xl font-bold text-white`}>About</h2>
          <p className={`${TOKENS.muted} mt-4 max-w-3xl`}>
            Local, insured, and focused on clean installs with premium LEDs. We handle everything:
            design, installation, quick service, and removal/storage.
          </p>
        </div>

        {/* Right: Contact block */}
        <div className="md:text-right">
          <h3 className={`${TOKENS.heading} text-2xl font-bold text-white`}>Contact</h3>
          <div className="mt-3 space-y-2">
            <p className={TOKENS.muted}>
              Email:{" "}
              <a href={`mailto:${EMAIL}`} className="text-amber-400 hover:underline">
                {EMAIL}
              </a>
            </p>
            <p className={TOKENS.muted}>
              Facebook:{" "}
              <a href={FB_URL} target="_blank" rel="noreferrer" className="text-amber-400 hover:underline">
                Bayfront Lighting
              </a>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-gray-700 py-8 text-center text-gray-400">
      <div className="mx-auto max-w-7xl px-6">
        © {new Date().getFullYear()} Bayfront Lighting. All rights reserved.
      </div>
    </footer>
  );
}

// -----------------------------------------------------------------------------
// Gallery Page
// -----------------------------------------------------------------------------
function GalleryPage() {
  const slides = computeSlides([
    "bush-with-light1.jpeg",
    "bush-with-light2.jpeg",
    "house-with-light7.jpeg",
    "wreath-on-house.jpeg",
    "house-with-light5.jpeg",
    "house-with-light6.jpeg",
    "house-with-light8.jpeg",
    "tree-with-light1.png",
    "house-with-light1.jpg",
    "house-with-light2.jpg",
    "house-with-light3.jpg",
    "house-with-light4.jpg",

  ]);
  return (
    <main className={`${TOKENS.text}`}>
      <HeaderBar />
      <section className="mx-auto max-w-7xl px-6 py-16">
        <h1 className={`${TOKENS.heading} text-4xl md:text-5xl font-bold`}>Gallery</h1>
        <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {slides.map((src, i) => (
            <img
              key={src + i}
              src={src}
              alt=""
              className="w-full h-56 object-cover rounded-lg ring-1 ring-white/10"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = BLANK_IMG;
                e.currentTarget.classList.add("opacity-50");
              }}
            />
          ))}
        </div>
      </section>
      <Footer />
    </main>
  );
}

// -----------------------------------------------------------------------------
// Home Page
// -----------------------------------------------------------------------------
function HomePage() {
  return (
    <main className={`${TOKENS.text}`}>
      <HeaderBar />
      <Hero />
      <Offerings />
      <CTA />
      <About />
      <Footer />
    </main>
  );
}

// -----------------------------------------------------------------------------
// Root
// -----------------------------------------------------------------------------
export default function Site() {
  const route = useRoute();
  return (
    <ThemeCtx.Provider value={{ tokens: TOKENS }}>
      {isGallery(route) ? <GalleryPage /> : <HomePage />}
    </ThemeCtx.Provider>
  );
}
