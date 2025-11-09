import { useAppContext } from "../context/AppContext";

const AboutPage = () => {
  const { translations, isArabic } = useAppContext();
  const about = translations.about;

  return (
    <div className={`mx-auto max-w-3xl space-y-4 px-6 py-8 ${isArabic ? "text-right" : ""}`}>
      <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-950/5">
        <h2 className="text-2xl font-semibold text-slate-900">{about.title}</h2>
        <p className="mt-4 text-sm text-slate-600">{about.intro}</p>
        <ul className="mt-4 list-disc space-y-3 text-sm text-slate-600 marker:text-brand">
          {about.bullets.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
        <p className="mt-4 text-sm text-slate-600">{about.closing}</p>
      </section>
    </div>
  );
};

export default AboutPage;
