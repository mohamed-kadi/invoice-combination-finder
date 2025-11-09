import { useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { API_BASE_URL } from "../config";
import { useAppContext } from "../context/AppContext";
import type { CombinationResponse } from "../types";
import {
  formatAmount,
  normaliseInvoiceAmounts,
  parseRequiredIds,
} from "../utils/finance";

const UploadPage = () => {
  const {
    translations,
    savedScenarios,
    setSavedScenarios,
    lastRequest,
    setLastRequest,
    lastRequestSource,
    setLastRequestSource,
    isArabic,
  } = useAppContext();

  const text = translations;
  const sidebarText = translations.sidebar;
  const sidebarLeftText = translations.sidebarLeft;
  const navText = translations.nav;

  const [excelTarget, setExcelTarget] = useState<string>("");
  const [excelMinInvoices, setExcelMinInvoices] = useState<string>("");
  const [excelMaxInvoices, setExcelMaxInvoices] = useState<string>("");
  const [excelRequiredIds, setExcelRequiredIds] = useState<string>("");
  const [excelFile, setExcelFile] = useState<File | null>(null);
  const [results, setResults] = useState<string[][]>([]);
  const [combinationCount, setCombinationCount] = useState<number | null>(null);
  const [excelError, setExcelError] = useState<string | null>(null);
  const [excelLoading, setExcelLoading] = useState(false);
  const [invoiceAmountsById, setInvoiceAmountsById] = useState<
    Record<string, number>
  >({});
  const [isExporting, setIsExporting] = useState(false);

  const handleFeatureNavigate = useCallback((targetId: string) => {
    if (typeof document === "undefined") {
      return;
    }
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  const handleExcelFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setExcelFile(file);
  };

  const handleExcelSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setExcelError(null);

    const targetNumber = Number(excelTarget);
    if (!Number.isFinite(targetNumber) || targetNumber <= 0) {
      setExcelError(text.errors.targetPositive);
      return;
    }

    const minInvoices = excelMinInvoices.trim()
      ? Number(excelMinInvoices)
      : undefined;
    if (
      excelMinInvoices.trim() &&
      (!Number.isInteger(minInvoices as number) || (minInvoices as number) <= 0)
    ) {
      setExcelError(text.errors.minPositive);
      return;
    }

    const maxInvoices = excelMaxInvoices.trim()
      ? Number(excelMaxInvoices)
      : undefined;
    if (
      excelMaxInvoices.trim() &&
      (!Number.isInteger(maxInvoices as number) || (maxInvoices as number) <= 0)
    ) {
      setExcelError(text.errors.maxPositive);
      return;
    }

    if (
      minInvoices !== undefined &&
      maxInvoices !== undefined &&
      maxInvoices < minInvoices
    ) {
      setExcelError(text.errors.minLessThanMax);
      return;
    }

    if (!excelFile) {
      setExcelError(text.errors.uploadFileRequired);
      return;
    }

    const requiredIds = parseRequiredIds(excelRequiredIds);

    setResults([]);
    setCombinationCount(null);
    setInvoiceAmountsById({});
    setExcelLoading(true);

    try {
      const formData = new FormData();
      formData.append("target", excelTarget);
      formData.append("file", excelFile);
      if (minInvoices !== undefined) {
        formData.append("minInvoices", String(minInvoices));
      }
      if (maxInvoices !== undefined) {
        formData.append("maxInvoices", String(maxInvoices));
      }
      requiredIds.forEach((id) => formData.append("requiredIds", id));

      const response = await fetch(`${API_BASE_URL}/api/combinations/upload`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        if (body?.message) {
          throw new Error(body.message);
        }
        throw new Error(text.errors.uploadFailed);
      }

      const data: CombinationResponse = await response.json();
      const normalisedAmounts = normaliseInvoiceAmounts(data.invoiceAmounts);
      setResults(data.combinations);
      setCombinationCount(data.combinationCount);
      setInvoiceAmountsById(normalisedAmounts);
      setLastRequest({
        target: excelTarget || targetNumber.toString(),
        invoices: Object.entries(normalisedAmounts).map(([id, amount]) => ({
          id,
          amount: amount.toString(),
        })),
        minInvoices,
        maxInvoices,
        requiredInvoiceIds: requiredIds,
      });
      setLastRequestSource("excel");
    } catch (uploadError) {
      if (uploadError instanceof Error && uploadError.message) {
        setExcelError(uploadError.message);
      } else {
        setExcelError(text.errors.excelUnexpected);
      }
      setResults([]);
      setCombinationCount(null);
    } finally {
      setExcelLoading(false);
    }
  };

  const handleExport = async () => {
    if (!lastRequest || lastRequestSource !== "excel") {
      setExcelError(text.errors.runSearchBeforeExport);
      return;
    }

    const exportTarget = Number(lastRequest.target);
    if (!Number.isFinite(exportTarget) || exportTarget <= 0) {
      setExcelError(text.errors.exportInvalidTarget);
      return;
    }

    const invoicePayload = lastRequest.invoices
      .map(({ id, amount }) => ({ id, amount: Number(amount) }))
      .filter((invoice) => Number.isFinite(invoice.amount) && invoice.amount > 0);

    if (invoicePayload.length === 0) {
      setExcelError(text.errors.exportNoInvoices);
      return;
    }

    const payload: Record<string, unknown> = {
      target: exportTarget,
      invoices: invoicePayload,
    };
    if (lastRequest.minInvoices !== undefined) {
      payload.minInvoices = lastRequest.minInvoices;
    }
    if (lastRequest.maxInvoices !== undefined) {
      payload.maxInvoices = lastRequest.maxInvoices;
    }
    if ((lastRequest.requiredInvoiceIds ?? []).length > 0) {
      payload.requiredInvoiceIds = lastRequest.requiredInvoiceIds;
    }

    setIsExporting(true);
    setExcelError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/combinations/export`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const body = await response.text();
        throw new Error(body || text.errors.exportUnexpected);
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "invoice-mix-combinations.csv";
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      if (error instanceof Error && error.message) {
        setExcelError(error.message);
      } else {
        setExcelError(text.errors.exportUnexpected);
      }
    } finally {
      setIsExporting(false);
    }
  };

  const handleSaveScenario = () => {
    if (!lastRequest) {
      setExcelError(text.errors.runSearchBeforeSave);
      return;
    }

    setExcelError(null);

    const defaultName = `${text.saved.defaultNamePrefix} ${
      savedScenarios.length + 1
    }`;
    const nameInput = window.prompt(text.saved.prompt, defaultName);
    if (!nameInput) {
      return;
    }

    const name = nameInput.trim();
    if (!name) {
      return;
    }

    const scenario = {
      id:
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : `${Date.now()}`,
      name,
      target: lastRequest.target,
      invoices: lastRequest.invoices.map((invoice) => ({ ...invoice })),
      minInvoices: lastRequest.minInvoices,
      maxInvoices: lastRequest.maxInvoices,
      requiredInvoiceIds: [...(lastRequest.requiredInvoiceIds ?? [])],
    };

    setSavedScenarios([...savedScenarios, scenario]);
  };

  const canExport =
    Boolean(lastRequest) &&
    results.length > 0 &&
    lastRequestSource === "excel" &&
    !isExporting;

  const hasExcelLastRequest =
    Boolean(lastRequest) && lastRequestSource === "excel";
  const lastExcelRequest = hasExcelLastRequest ? lastRequest : null;
  const targetDisplay = lastExcelRequest
    ? formatAmount(lastExcelRequest.target)
    : sidebarText.rangeUnset;
  const invoiceCountDisplay = lastExcelRequest
    ? String(lastExcelRequest.invoices.length)
    : sidebarText.rangeUnset;
  const minInvoicesValue = lastExcelRequest?.minInvoices;
  const maxInvoicesValue = lastExcelRequest?.maxInvoices;
  const hasRange =
    lastExcelRequest &&
    (minInvoicesValue !== undefined || maxInvoicesValue !== undefined);
  const rangeDisplay = hasRange
    ? `${minInvoicesValue ?? "—"} - ${maxInvoicesValue ?? "—"}`
    : sidebarText.rangeUnset;
  const requiredIdsList = lastExcelRequest?.requiredInvoiceIds ?? [];
  const requiredDisplay =
    requiredIdsList.length > 0
      ? requiredIdsList.join(", ")
      : sidebarText.requiredEmpty;
  const canSaveScenario = Boolean(lastRequest);

  type SidebarTabKey = "summary" | "actions" | "shortcuts";
  const [activeSidebarTab, setActiveSidebarTab] = useState<SidebarTabKey | null>(
    "summary"
  );
  const sidebarTabs: Array<{ key: SidebarTabKey; label: string }> = [
    { key: "summary", label: sidebarText.tabSummary },
    { key: "actions", label: sidebarText.tabActions },
    { key: "shortcuts", label: sidebarText.tabShortcuts },
  ];

  const renderSidebarContent = (tabKey: SidebarTabKey) => {
    if (tabKey === "summary") {
      return lastExcelRequest ? (
        <dl
          className={`space-y-4 text-sm text-slate-600 ${
            isArabic ? "text-right" : "text-left"
          }`}
        >
          <div
            className={`flex items-baseline justify-between gap-3 ${
              isArabic ? "flex-row-reverse text-right" : ""
            }`}
          >
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              {sidebarText.targetLabel}
            </dt>
            <dd className="text-sm font-semibold text-slate-900">
              {targetDisplay}
            </dd>
          </div>
          <div
            className={`flex items-baseline justify-between gap-3 ${
              isArabic ? "flex-row-reverse text-right" : ""
            }`}
          >
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              {sidebarText.invoiceCountLabel}
            </dt>
            <dd className="text-sm font-semibold text-slate-900">
              {invoiceCountDisplay}
            </dd>
          </div>
          <div
            className={`flex items-baseline justify-between gap-3 ${
              isArabic ? "flex-row-reverse text-right" : ""
            }`}
          >
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              {sidebarText.rangeLabel}
            </dt>
            <dd className="text-sm font-semibold text-slate-900">
              {rangeDisplay}
            </dd>
          </div>
          <div
            className={`flex flex-col gap-1 ${
              isArabic ? "items-end text-right" : "text-left"
            }`}
          >
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              {sidebarText.requiredLabel}
            </dt>
            <dd className="text-sm font-medium text-slate-900">
              {requiredDisplay}
            </dd>
          </div>
        </dl>
      ) : (
        <p className="text-sm text-slate-500">{sidebarText.lastRunEmpty}</p>
      );
    }

    if (tabKey === "actions") {
      return (
        <div
          className={`flex flex-col gap-3 ${
            isArabic ? "items-stretch text-right" : "text-left"
          }`}
        >
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-full border border-brand bg-white px-5 py-2 text-sm font-semibold text-brand transition hover:bg-brand/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            {text.manualForm.title}
          </Link>
          <Link
            to="/upload"
            aria-current="page"
            className="inline-flex items-center justify-center rounded-full border border-emerald-500 bg-emerald-500 px-5 py-2 text-sm font-semibold text-white transition hover:bg-emerald-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500"
          >
            {text.excelForm.title}
          </Link>
          <button
            type="button"
            onClick={handleExport}
            disabled={!canExport}
            className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-5 py-2 text-sm font-semibold text-white transition hover:bg-emerald-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500 disabled:cursor-not-allowed disabled:bg-emerald-300"
          >
            {isExporting ? text.results.exporting : text.results.exportCsv}
          </button>
          <button
            type="button"
            onClick={handleSaveScenario}
            disabled={!canSaveScenario}
            className="inline-flex items-center justify-center rounded-full border border-brand bg-white px-5 py-2 text-sm font-semibold text-brand transition hover:bg-brand/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-300"
          >
            {text.results.saveScenario}
          </button>
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-full border border-brand/50 bg-white px-5 py-2 text-sm font-medium text-brand transition hover:bg-brand/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            {sidebarText.savedCta}
          </Link>
        </div>
      );
    }

    return (
      <div
        className={`space-y-3 text-sm text-slate-600 ${
          isArabic ? "text-right" : "text-left"
        }`}
      >
        {sidebarLeftText.features.map((feature) => (
          <button
            key={feature.id}
            type="button"
            onClick={() => handleFeatureNavigate(feature.id)}
            className={`w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-semibold text-slate-800 transition hover:border-brand/50 hover:bg-white ${
              isArabic ? "text-right" : "text-left"
            }`}
          >
            <div className="text-sm">{feature.title}</div>
            <p className="mt-1 text-xs font-normal text-slate-500">
              {feature.description}
            </p>
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <div className="flex flex-col gap-6 lg:grid lg:grid-cols-[320px_minmax(0,1fr)] lg:items-start lg:gap-8">
        <aside
          className={`flex flex-col gap-6 ${
            isArabic
              ? "text-right lg:border-l lg:border-slate-200/70 lg:pl-6"
              : "text-left lg:border-r lg:border-slate-200/70 lg:pr-6"
          } lg:sticky lg:top-24`}
        >
          <div
            className={`hidden lg:block w-full rounded-3xl bg-slate-50/80 p-6 ${
              isArabic ? "text-right" : "text-left"
            }`}
          >
            <nav className="flex w-full flex-col gap-4">
              {sidebarTabs.map((tab) => {
                const isActive = activeSidebarTab === tab.key;
                return (
                  <div key={tab.key} className="w-full">
                    <button
                      type="button"
                      onClick={() =>
                        setActiveSidebarTab((prev) => (prev === tab.key ? null : tab.key))
                      }
                      className={`w-full rounded-2xl px-4 py-2 text-sm font-semibold transition ${
                        isActive
                          ? "bg-white text-brand shadow-sm"
                          : "bg-white/40 text-slate-500 hover:text-brand"
                      } ${isArabic ? "text-right" : "text-left"}`}
                    >
                      {tab.label}
                    </button>
                    {isActive && (
                      <div className="mt-3 rounded-2xl bg-white p-6 text-sm text-slate-600 shadow-sm ring-1 ring-slate-950/5">
                        {renderSidebarContent(tab.key)}
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>
          </div>

          <div className="space-y-4 lg:hidden">
            <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-950/5">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                {sidebarText.lastRunTitle}
              </h2>
              {lastExcelRequest ? (
                <dl className="mt-4 space-y-3 text-sm text-slate-600">
                  <div className="flex items-baseline justify-between gap-3">
                    <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      {sidebarText.targetLabel}
                    </dt>
                    <dd className="text-sm font-semibold text-slate-900">
                      {targetDisplay}
                    </dd>
                  </div>
                  <div className="flex items-baseline justify-between gap-3">
                    <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      {sidebarText.invoiceCountLabel}
                    </dt>
                    <dd className="text-sm font-semibold text-slate-900">
                      {invoiceCountDisplay}
                    </dd>
                  </div>
                  <div className="flex items-baseline justify-between gap-3">
                    <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      {sidebarText.rangeLabel}
                    </dt>
                    <dd className="text-sm font-semibold text-slate-900">
                      {rangeDisplay}
                    </dd>
                  </div>
                  <div className="flex flex-col gap-1">
                    <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      {sidebarText.requiredLabel}
                    </dt>
                    <dd className="text-sm font-medium text-slate-900">
                      {requiredDisplay}
                    </dd>
                  </div>
                </dl>
              ) : (
                <p className="mt-3 text-sm text-slate-500">
                  {sidebarText.lastRunEmpty}
                </p>
              )}
            </section>

            <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-950/5">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                {sidebarText.quickActionsTitle}
              </h2>
              <div className="mt-3 flex flex-col gap-3">
                <Link
                  to="/"
                  className="inline-flex w-full items-center justify-center rounded-full border border-brand bg-brand px-5 py-2 text-sm font-semibold text-white transition hover:bg-brand-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                >
                  {text.manualForm.title}
                </Link>
                <Link
                  to="/upload"
                  aria-current="page"
                  className="inline-flex w-full items-center justify-center rounded-full border border-emerald-500 bg-emerald-500 px-5 py-2 text-sm font-semibold text-white transition hover:bg-emerald-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500"
                >
                  {text.excelForm.title}
                </Link>
                <button
                  type="button"
                  onClick={handleExport}
                  disabled={!canExport}
                  className="inline-flex w-full items-center justify-center rounded-full bg-emerald-500 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500 disabled:cursor-not-allowed disabled:bg-emerald-300"
                >
                  {isExporting ? text.results.exporting : text.results.exportCsv}
                </button>
                <button
                  type="button"
                  onClick={handleSaveScenario}
                  disabled={!canSaveScenario}
                  className="inline-flex w-full items-center justify-center rounded-full border border-brand bg-white px-5 py-2 text-sm font-semibold text-brand transition hover:bg-brand/10 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-300"
                >
                  {text.results.saveScenario}
                </button>
                <Link
                  to="/"
                  className="inline-flex w-full items-center justify-center rounded-full border border-brand bg-white px-5 py-2 text-sm font-semibold text-brand transition hover:bg-brand/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                >
                  {sidebarText.savedCta}
                </Link>
              </div>
            </section>

            <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-950/5">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                {sidebarText.tabShortcuts}
              </h2>
              <div className="mt-3 space-y-3">
                {sidebarLeftText.features.map((feature) => (
                  <button
                    key={feature.id}
                    type="button"
                    onClick={() => handleFeatureNavigate(feature.id)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-left text-sm font-semibold text-slate-800 transition hover:border-brand/50 hover:bg-white"
                  >
                    <div>{feature.title}</div>
                    <p className="mt-1 text-xs font-normal text-slate-500">
                      {feature.description}
                    </p>
                  </button>
                ))}
              </div>
            </section>
          </div>
        </aside>

        <div className={`space-y-6 ${isArabic ? "text-right" : ""}`}>
          <section
            id="workspace-primary"
            className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-950/5"
          >
            <h2 className="text-lg font-semibold text-slate-900">
              {text.excelForm.title}
            </h2>
            <form
              className="mt-4 flex flex-col gap-6 sm:mx-auto sm:max-w-2xl"
              onSubmit={handleExcelSubmit}
            >
              <div>
                <label className="block text-sm font-medium text-slate-700">
                  {text.excelForm.targetLabel}
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  inputMode="decimal"
                  value={excelTarget}
                  onChange={(event) => setExcelTarget(event.target.value)}
                  placeholder="e.g. 2500.00"
                  className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/40 md:text-base"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    {text.excelForm.minLabel}
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={excelMinInvoices}
                    onChange={(event) => setExcelMinInvoices(event.target.value)}
                    placeholder={text.manualForm.optionalPlaceholder}
                    className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/40 md:text-base"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    {text.excelForm.maxLabel}
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={excelMaxInvoices}
                    onChange={(event) => setExcelMaxInvoices(event.target.value)}
                    placeholder={text.manualForm.optionalPlaceholder}
                    className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/40 md:text-base"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-slate-700">
                    {text.excelForm.requiredLabel}
                  </label>
                  <span className="text-xs text-slate-500">
                    {text.excelForm.requiredHelper}
                  </span>
                </div>
                <input
                  type="text"
                  value={excelRequiredIds}
                  onChange={(event) => setExcelRequiredIds(event.target.value)}
                  placeholder="INV-001, INV-010"
                  className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/40 md:text-base"
                />
              </div>

              <div>
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-center gap-2">
                    <label
                      htmlFor="invoice-file"
                      className="text-sm font-medium text-slate-700"
                    >
                      {text.excelForm.fileLabel}
                    </label>
                  </div>
                  <span className="text-xs text-slate-500">
                    {text.excelForm.fileHint}
                  </span>
                </div>
                <input
                  id="invoice-file"
                  type="file"
                  accept=".xlsx"
                  onChange={handleExcelFileChange}
                  className="mt-2 w-full cursor-pointer rounded-lg border border-dashed border-slate-300 bg-slate-50 px-3 py-3 text-sm text-slate-600 file:mr-4 file:rounded-md file:border-0 file:bg-brand file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:border-brand/70"
                />
                {excelFile && (
                  <p className="mt-2 text-xs text-slate-500">
                    {`${text.excelForm.selectedFileLabel} ${excelFile.name}`}
                  </p>
                )}
              </div>

              {excelError && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {excelError}
                </div>
              )}

              <div className="flex justify-center">
                <button
                  type="submit"
                  disabled={excelLoading}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-500 px-6 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500 disabled:cursor-not-allowed disabled:bg-emerald-300 sm:px-8 sm:text-base"
                >
                  {excelLoading ? text.excelForm.processing : text.excelForm.submit}
                </button>
              </div>
            </form>
          </section>

          <section
            id="workspace-results"
            className="space-y-4 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-950/5"
          >
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="text-center md:text-left">
                <h2 className="text-lg font-semibold text-slate-900">
                  {text.results.title}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  {combinationCount === null && results.length === 0
                    ? text.results.introIdle
                    : combinationCount === 0
                    ? text.results.introEmpty
                    : (combinationCount ?? 0) === 1
                    ? text.results.introFoundSingle
                    : text.results.introFoundPlural.replace(
                        "{{count}}",
                        String(combinationCount)
                      )}
                </p>
              </div>
              <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center md:justify-end lg:hidden">
                <button
                  type="button"
                  onClick={handleSaveScenario}
                  disabled={!canSaveScenario}
                  className="inline-flex items-center justify-center rounded-full border border-brand bg-white px-5 py-2 text-sm font-semibold text-brand transition hover:bg-brand/10 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-300 sm:px-6 sm:text-base"
                >
                  {text.results.saveScenario}
                </button>
                <button
                  type="button"
                  disabled={!canExport}
                  onClick={handleExport}
                  className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500 disabled:cursor-not-allowed disabled:bg-emerald-300 sm:px-6 sm:text-base"
                >
                  {isExporting ? text.results.exporting : text.results.exportCsv}
                </button>
              </div>
              <div className="hidden items-center gap-3 lg:flex">
                <button
                  type="button"
                  onClick={handleSaveScenario}
                  disabled={!canSaveScenario}
                  className="inline-flex items-center justify-center rounded-full border border-brand bg-white px-5 py-2 text-sm font-semibold text-brand transition hover:bg-brand/10 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-300"
                >
                  {text.results.saveScenario}
                </button>
                <button
                  type="button"
                  disabled={!canExport}
                  onClick={handleExport}
                  className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500 disabled:cursor-not-allowed disabled:bg-emerald-300"
                >
                  {isExporting ? text.results.exporting : text.results.exportCsv}
                </button>
                <Link
                  to="/"
                  className="inline-flex items-center justify-center rounded-full border border-brand bg-white px-5 py-2 text-sm font-semibold text-brand transition hover:bg-brand/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                >
                  {text.manualForm.title}
                </Link>
              </div>
            </div>

            {results.length > 0 && (
              <div className="space-y-3">
                {results.map((combination, index) => (
                  <article
                    key={index}
                    className="rounded-xl border border-slate-200 bg-gradient-to-br from-white via-white to-slate-50 p-4 shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold uppercase tracking-wide text-brand">
                        {`${text.results.combinationLabelPrefix} ${index + 1}`}
                      </h3>
                      <span className="text-sm font-medium text-slate-500">
                        {text.results.totalLabel}{" "}
                        {formatAmount(
                          combination.reduce((sum, id) => {
                            const amount = invoiceAmountsById[id];
                            if (typeof amount !== "number") {
                              return sum;
                            }
                            return sum + amount;
                          }, 0)
                        )}
                      </span>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {combination.map((invoiceId, itemIndex) => (
                        <span
                          key={`${index}-${itemIndex}-${invoiceId}`}
                          className="inline-flex items-center rounded-full bg-brand/10 px-3 py-1 text-sm font-medium text-brand-dark"
                        >
                          <span className="font-semibold">{invoiceId}</span>
                          <span className="ml-1 text-xs text-brand-dark/80">
                            {formatAmount(invoiceAmountsById[invoiceId])}
                          </span>
                        </span>
                      ))}
                    </div>
                  </article>
                ))}
              </div>
            )}

            {results.length === 0 && combinationCount === 0 && (
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                {text.results.noResultsHelp}
              </div>
            )}
          </section>

          <section
            id="workspace-scenarios"
            className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-950/5"
          >
            <h2 className="text-lg font-semibold text-slate-900">
              {text.saved.title}
            </h2>
            <p className="mt-3 text-sm text-slate-500">
              {sidebarText.savedCta}
            </p>
            <Link
              to="/"
              className="mt-4 inline-flex items-center justify-center rounded-full border border-brand bg-white px-5 py-2 text-sm font-semibold text-brand transition hover:bg-brand/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            >
              {navText.features}
            </Link>
          </section>

        </div>

      </div>
    </div>
  );
};

export default UploadPage;
