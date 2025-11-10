import {
  lazy,
  Suspense,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  BrowserRouter,
  Route,
  Routes,
  useLocation,
  Link,
} from "react-router-dom";
import { AppProviders, useAppContext } from "./context/AppContext";
import type { Language } from "./types";
import brandLogo from "./assets/invoicemix-logo.svg";

const FeaturesPage = lazy(() => import("./pages/FeaturesPage"));
const UploadPage = lazy(() => import("./pages/UploadPage"));
const AboutPage = lazy(() => import("./pages/AboutPage"));
const TipsPage = lazy(() => import("./pages/TipsPage"));

const NAV_ITEMS = [
  { path: "/", labelKey: "features" as const },
  { path: "/upload", labelKey: "upload" as const },
  { path: "/about", labelKey: "about" as const },
  { path: "/tips", labelKey: "tips" as const },
];

const LANGUAGE_CODES: Language[] = ["en", "fr", "ar"];

function NavBar() {
  const { translations, language, setLanguage, isArabic } = useAppContext();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const currentPath = location.pathname;
  const text = translations.nav;

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname, language]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  return (
    <nav className="bg-white/80 backdrop-blur border-b border-slate-200">
      <div className="mx-auto w-full max-w-5xl px-6 py-3 space-y-3">
        <div
          className={`flex items-center justify-between ${
            isArabic ? "flex-row-reverse" : ""
          }`}
        >
          <Link
            to="/"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm shadow-brand/10 ring-1 ring-brand/10 transition hover:-translate-y-0.5 hover:shadow-brand/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            aria-label={translations.header.homeLinkAria}
          >
            <img src={brandLogo} alt="InvoiceMix logo" className="h-6 w-6" />
          </Link>
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setIsMenuOpen((prev) => !prev)}
              aria-haspopup="true"
              aria-expanded={isMenuOpen}
              aria-label={translations.languageSelectorAria}
              className="flex items-center gap-2 rounded-full border border-slate-300 bg-white px-3 py-1 text-xs font-semibold text-slate-600 transition hover:border-brand/60 hover:text-brand"
            >
              <span className="sr-only">{text.languageLabel}</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="h-5 w-5"
              >
                <path d="M12 21c4.97 0 9-4.03 9-9s-4.03-9-9-9-9 4.03-9 9 4.03 9 9 9Z" />
                <path d="M3.6 9h16.8" />
                <path d="M3.6 15h16.8" />
                <path d="M12 3c-2.5 3-3.75 6-3.75 9s1.25 6 3.75 9c2.5-3 3.75-6 3.75-9s-1.25-6-3.75-9Z" />
              </svg>
            </button>
            {isMenuOpen && (
              <div
                className={`absolute z-50 mt-2 w-36 rounded-xl border border-slate-200 bg-white shadow-xl ${
                  isArabic ? "left-0" : "right-0"
                }`}
                role="menu"
              >
                {LANGUAGE_CODES.map((code) => (
                  <button
                    key={code}
                    type="button"
                    onClick={() => setLanguage(code)}
                    className={`flex w-full items-center justify-between px-3 py-2 text-sm transition ${
                      language === code
                        ? "bg-brand text-white"
                        : "text-slate-600 hover:bg-slate-100"
                    }`}
                    role="menuitem"
                  >
                    <span>{translations.languages[code]}</span>
                    {language === code && <span>•</span>}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        <div
          className={`flex flex-wrap items-center gap-4 ${
            isArabic ? "justify-end text-right" : "justify-start"
          }`}
        >
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              aria-current={currentPath === item.path ? "page" : undefined}
              className={`text-sm font-semibold transition ${
                currentPath === item.path
                  ? "text-brand"
                  : "text-slate-700 hover:text-brand"
              }`}
            >
              {text[item.labelKey]}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}

function Header() {
  const { translations, isArabic } = useAppContext();
  const location = useLocation();
  const text = translations.header;
  const showCarousel = location.pathname === "/";
  const slides =
    showCarousel && text.carousel && text.carousel.length > 0 ? text.carousel : [];
  const slidesSignature = slides.length > 0 ? slides.join("|") : "static";
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    setActiveSlide(0);
  }, [slidesSignature, showCarousel]);

  useEffect(() => {
    if (!showCarousel || slides.length <= 1) {
      return undefined;
    }
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [slides.length, slidesSignature, showCarousel]);

  return (
    <header className="bg-gradient-to-br from-white via-white to-slate-100 shadow">
      <div
        className={`mx-auto flex max-w-5xl flex-col items-center gap-6 px-6 py-12 text-center md:flex-row md:items-center md:justify-center md:gap-10 ${
          isArabic ? "md:flex-row-reverse" : ""
        }`}
      >
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white shadow-lg shadow-brand/10 ring-1 ring-brand/20">
          <img src={brandLogo} alt="InvoiceMix logo" className="h-12 w-12" />
        </div>
        <div className="max-w-2xl space-y-5 text-center">
          <p className="inline-flex items-center justify-center rounded-full bg-brand/10 px-5 py-1.5 text-xs font-semibold uppercase tracking-[0.3em] text-brand-dark">
            InvoiceMix
          </p>
          <h1 className="text-3xl font-bold leading-tight text-slate-900 md:text-4xl">
            {text.tagline}
          </h1>
          {showCarousel && slides.length > 0 ? (
            <div className="relative w-full min-h-[180px] overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-white via-white to-slate-50 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
              {slides.map((message, index) => {
                const title = text.carouselTitles?.[index] ?? `0${index + 1}`;
                const variant = index % 3;
                const gradient =
                  variant === 0
                    ? "from-emerald-50 via-white to-white"
                    : variant === 1
                    ? "from-sky-50 via-white to-white"
                    : "from-fuchsia-50 via-white to-white";
                const border =
                  variant === 0
                    ? "border-emerald-100"
                    : variant === 1
                    ? "border-sky-100"
                    : "border-fuchsia-100";
                return (
                  <article
                    key={`${slidesSignature}-${index}`}
                    className={`absolute inset-0 flex h-full w-full flex-col items-center justify-start gap-2 px-6 py-6 text-center transition-all duration-700 ${
                      index === activeSlide
                        ? "opacity-100 blur-0"
                        : "pointer-events-none opacity-0 blur-sm"
                    }`}
                    aria-hidden={index !== activeSlide}
                    aria-live={index === activeSlide ? "polite" : "off"}
                  >
                    <div
                      className={`rounded-xl border ${border} bg-gradient-to-br ${gradient} px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.3em] text-slate-500`}
                    >
                      {title}
                    </div>
                    <p className="text-sm text-slate-600">{message}</p>
                  </article>
                );
              })}
              {slides.length > 1 && (
                <div className="absolute inset-x-0 bottom-4 flex justify-center gap-2">
                  {slides.map((_, index) => (
                    <button
                      key={`carousel-dot-${index}`}
                      type="button"
                      onClick={() => setActiveSlide(index)}
                      className={`h-2.5 w-8 rounded-full transition ${
                        index === activeSlide
                          ? "bg-brand shadow-md"
                          : "bg-slate-200 hover:bg-brand/70"
                      }`}
                      aria-label={text.carouselAria.replace(
                        "{{index}}",
                        String(index + 1)
                      )}
                      aria-pressed={index === activeSlide}
                    />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <p className="text-base text-slate-600">{text.description}</p>
          )}
        </div>
      </div>
    </header>
  );
}

function RoutedApp() {
  const { isArabic } = useAppContext();

  return (
    <div className={`min-h-screen bg-slate-100 ${isArabic ? "font-[\"Cairo\"]" : ""}`}>
      <NavBar />
      <Header />
      <Suspense fallback={<div className="p-8 text-center text-slate-500">Loading...</div>}>
        <Routes>
          <Route path="/" element={<FeaturesPage />} />
          <Route path="/upload" element={<UploadPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/tips" element={<TipsPage />} />
        </Routes>
      </Suspense>
      <Footer />
    </div>
  );
}

function Footer() {
  const { translations, isArabic } = useAppContext();
  const footer = translations.footer;
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-200 bg-white/90">
      <div
        className={`mx-auto flex max-w-5xl flex-col gap-2 px-6 py-6 text-center md:flex-row md:items-center md:justify-between ${
          isArabic ? "md:flex-row-reverse md:text-right" : "md:text-left"
        }`}
      >
        <p className="text-sm text-slate-600">{footer.tagline}</p>
        <p className="text-xs text-slate-400">
          {footer.copyright.replace("{{year}}", String(year))}
        </p>
      </div>
    </footer>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppProviders>
        <RoutedApp />
      </AppProviders>
    </BrowserRouter>
  );
}

export default App;
