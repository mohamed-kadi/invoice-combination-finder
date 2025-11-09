import { useAppContext } from "../context/AppContext";

const TipsPage = () => {
  const { translations, isArabic } = useAppContext();
  const sidebar = translations.sidebar;

  return (
    <div
      className={`mx-auto flex h-full max-w-3xl flex-col space-y-4 px-6 py-8 ${
        isArabic ? "text-right" : ""
      }`}
    >
      <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-950/5">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-2xl font-semibold text-slate-900">
            {sidebar.tipsTitle}
          </h2>
          <span className="text-xs font-semibold uppercase tracking-wide text-brand">
            InvoiceMix
          </span>
        </div>
        <ul className="mt-4 list-disc space-y-3 text-sm text-slate-600 marker:text-brand">
          {sidebar.tips.map((tip, index) => (
            <li key={`${index}-${tip.slice(0, 12)}`}>{tip}</li>
          ))}
        </ul>
      </section>
      <div className="flex-1" />
    </div>
  );
};

export default TipsPage;
