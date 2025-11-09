import { useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { API_BASE_URL } from "../config";
import { useAppContext } from "../context/AppContext";
import type {
  CombinationResponse,
  InvoiceFormEntry,
  SavedScenario,
} from "../types";
import {
  formatAmount,
  normaliseInvoiceAmounts,
  parseRequiredIds,
} from "../utils/finance";

const createEmptyInvoice = (): InvoiceFormEntry => ({ id: "", amount: "" });

const FeaturesPage = () => {
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

  const [manualTarget, setManualTarget] = useState<string>("");
  const [manualMinInvoices, setManualMinInvoices] = useState<string>("");
  const [manualMaxInvoices, setManualMaxInvoices] = useState<string>("");
  const [manualRequiredIds, setManualRequiredIds] = useState<string>("");
  const [invoices, setInvoices] = useState<InvoiceFormEntry[]>([
    createEmptyInvoice(),
  ]);
  const [results, setResults] = useState<string[][]>([]);
  const [combinationCount, setCombinationCount] = useState<number | null>(null);
  const [manualLoading, setManualLoading] = useState(false);
  const [manualError, setManualError] = useState<string | null>(null);
  const [invoiceAmountsById, setInvoiceAmountsById] = useState<
    Record<string, number>
  >({});
  const [activeScenarioId, setActiveScenarioId] = useState<string | null>(null);

  const handleInvoiceFieldChange = (
    index: number,
    field: keyof InvoiceFormEntry,
    value: string
  ) => {
    setInvoices((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const addInvoiceField = () => setInvoices((prev) => [...prev, createEmptyInvoice()]);

  const removeInvoiceField = (index: number) => {
    setInvoices((prev) => {
      if (prev.length === 1) {
        return [createEmptyInvoice()];
      }
      return prev.filter((_, idx) => idx !== index);
    });
  };

  const handleManualSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setManualError(null);

    const targetNumber = Number(manualTarget);
    const normalisedInvoices = invoices
      .map(({ id, amount }) => ({
        id: id.trim(),
        amountRaw: amount.trim(),
      }))
      .filter(({ id, amountRaw }) => id !== "" || amountRaw !== "");

    const minInvoices = manualMinInvoices.trim()
      ? Number(manualMinInvoices)
      : undefined;
    if (
      manualMinInvoices.trim() &&
      (!Number.isInteger(minInvoices as number) || (minInvoices as number) <= 0)
    ) {
      setManualError(text.errors.minPositive);
      return;
    }

    const maxInvoices = manualMaxInvoices.trim()
      ? Number(manualMaxInvoices)
      : undefined;
    if (
      manualMaxInvoices.trim() &&
      (!Number.isInteger(maxInvoices as number) || (maxInvoices as number) <= 0)
    ) {
      setManualError(text.errors.maxPositive);
      return;
    }

    if (
      minInvoices !== undefined &&
      maxInvoices !== undefined &&
      maxInvoices < minInvoices
    ) {
      setManualError(text.errors.minLessThanMax);
      return;
    }

    const requiredIds = parseRequiredIds(manualRequiredIds);

    if (!Number.isFinite(targetNumber) || targetNumber <= 0) {
      setManualError(text.errors.targetPositive);
      return;
    }

    if (normalisedInvoices.length === 0) {
      setManualError(text.errors.addInvoices);
      return;
    }

    const missingFields = normalisedInvoices.find(
      ({ id, amountRaw }) => id === "" || amountRaw === ""
    );
    if (missingFields) {
      setManualError(text.errors.missingFields);
      return;
    }

    const payload = normalisedInvoices.map(({ id, amountRaw }) => ({
      id,
      amount: Number(amountRaw),
    }));

    if (payload.some(({ amount }) => !Number.isFinite(amount) || amount <= 0)) {
      setManualError(text.errors.numbersPositive);
      return;
    }

    const duplicateId = payload
      .map(({ id }) => id)
      .find((id, idx, arr) => arr.indexOf(id) !== idx);
    if (duplicateId) {
      setManualError(
        text.errors.duplicateIdTemplate.replace("{{id}}", duplicateId)
      );
      return;
    }

    setResults([]);
    setCombinationCount(null);
    setManualLoading(true);
    setInvoiceAmountsById({});

    try {
      const requestBody: Record<string, unknown> = {
        target: targetNumber,
        invoices: payload,
      };
      if (minInvoices !== undefined) {
        requestBody.minInvoices = minInvoices;
      }
      if (maxInvoices !== undefined) {
        requestBody.maxInvoices = maxInvoices;
      }
      if (requiredIds.length > 0) {
        requestBody.requiredInvoiceIds = requiredIds;
      }

      const response = await fetch(`${API_BASE_URL}/api/combinations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        if (body?.message) {
          throw new Error(body.message);
        }
        throw new Error(text.errors.fetchFailed);
      }

      const data: CombinationResponse = await response.json();
      const normalisedAmounts = normaliseInvoiceAmounts(data.invoiceAmounts);

      setResults(data.combinations);
      setCombinationCount(data.combinationCount);
      setInvoiceAmountsById(normalisedAmounts);
      setLastRequest({
        target: manualTarget || targetNumber.toString(),
        invoices: normalisedInvoices.map(({ id, amountRaw }) => ({
          id,
          amount: amountRaw,
        })),
        minInvoices,
        maxInvoices,
        requiredInvoiceIds: requiredIds,
      });
      setLastRequestSource("manual");
      setActiveScenarioId(null);
    } catch (fetchError) {
      if (fetchError instanceof Error && fetchError.message) {
        setManualError(fetchError.message);
      } else {
        setManualError(text.errors.manualUnexpected);
      }
      setResults([]);
      setCombinationCount(null);
    } finally {
      setManualLoading(false);
    }
  };

  const handleSaveScenario = () => {
    if (!lastRequest) {
      setManualError(text.errors.runSearchBeforeSave);
      return;
    }

    setManualError(null);

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

  const handleLoadScenario = async (scenario: SavedScenario) => {
    setManualTarget(scenario.target);
    setInvoices(
      scenario.invoices.length > 0
        ? scenario.invoices.map((invoice) => ({ ...invoice }))
        : [createEmptyInvoice()]
    );
    setManualMinInvoices(
      scenario.minInvoices !== undefined ? scenario.minInvoices.toString() : ""
    );
    setManualMaxInvoices(
      scenario.maxInvoices !== undefined ? scenario.maxInvoices.toString() : ""
    );
    const requiredList = scenario.requiredInvoiceIds ?? [];
    setManualRequiredIds(requiredList.join(", "));
    setActiveScenarioId(scenario.id);
    setLastRequest({
      target: scenario.target,
      invoices: scenario.invoices.map((invoice) => ({ ...invoice })),
      minInvoices: scenario.minInvoices,
      maxInvoices: scenario.maxInvoices,
      requiredInvoiceIds: [...requiredList],
    });
    setLastRequestSource("manual");

    const targetNumber = Number(scenario.target);
    if (!Number.isFinite(targetNumber) || targetNumber <= 0) {
      setManualError(text.errors.targetPositive);
      return;
    }

    const invoicePayload = scenario.invoices
      .map(({ id, amount }) => ({
        id: id.trim(),
        amount: Number(amount),
      }))
      .filter(
        ({ id, amount }) => id !== "" && Number.isFinite(amount) && amount > 0
      );

    if (invoicePayload.length === 0) {
      setManualError(text.errors.addInvoices);
      return;
    }

    const payload: Record<string, unknown> = {
      target: targetNumber,
      invoices: invoicePayload,
    };
    if (scenario.minInvoices !== undefined) {
      payload.minInvoices = scenario.minInvoices;
    }
    if (scenario.maxInvoices !== undefined) {
      payload.maxInvoices = scenario.maxInvoices;
    }
    if ((scenario.requiredInvoiceIds ?? []).length > 0) {
      payload.requiredInvoiceIds = scenario.requiredInvoiceIds;
    }

    setManualLoading(true);
    setManualError(null);
    setResults([]);
    setCombinationCount(null);
    setInvoiceAmountsById({});

    try {
      const response = await fetch(`${API_BASE_URL}/api/combinations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        if (body?.message) {
          throw new Error(body.message);
        }
        throw new Error(text.errors.fetchFailed);
      }

      const data: CombinationResponse = await response.json();
      const normalisedAmounts = normaliseInvoiceAmounts(data.invoiceAmounts);

      setResults(data.combinations);
      setCombinationCount(data.combinationCount);
      setInvoiceAmountsById(normalisedAmounts);
      setLastRequest({
        target: scenario.target,
        invoices: scenario.invoices.map((invoice) => ({ ...invoice })),
        minInvoices: scenario.minInvoices,
        maxInvoices: scenario.maxInvoices,
        requiredInvoiceIds: [...requiredList],
      });
      setLastRequestSource("manual");
    } catch (error) {
      if (error instanceof Error && error.message) {
        setManualError(error.message);
      } else {
        setManualError(text.errors.manualUnexpected);
      }
    } finally {
      setManualLoading(false);
    }
  };

  const handleDeleteScenario = (id: string) => {
    setSavedScenarios(savedScenarios.filter((scenario) => scenario.id !== id));
    setActiveScenarioId((current) => (current === id ? null : current));
  };

  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    if (!lastRequest || lastRequestSource !== "manual") {
      setManualError(text.errors.runSearchBeforeExport);
      return;
    }

    const exportTarget = Number(lastRequest.target);
    if (!Number.isFinite(exportTarget) || exportTarget <= 0) {
      setManualError(text.errors.exportInvalidTarget);
      return;
    }

    const invoicePayload = lastRequest.invoices
      .map(({ id, amount }) => ({ id, amount: Number(amount) }))
      .filter((invoice) => Number.isFinite(invoice.amount) && invoice.amount > 0);

    if (invoicePayload.length === 0) {
      setManualError(text.errors.exportNoInvoices);
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
    setManualError(null);

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
        setManualError(error.message);
      } else {
        setManualError(text.errors.exportUnexpected);
      }
    } finally {
      setIsExporting(false);
    }
  };

  const canExport =
    Boolean(lastRequest) &&
    results.length > 0 &&
    lastRequestSource === "manual" &&
    !isExporting;

  const sidebarText = translations.sidebar;
  const sidebarLeftText = translations.sidebarLeft;
  const hasManualLastRequest =
    Boolean(lastRequest) && lastRequestSource === "manual";
  const lastManualRequest = hasManualLastRequest ? lastRequest : null;
  const canSaveScenario = Boolean(lastRequest);
  const targetDisplay = lastManualRequest
    ? formatAmount(lastManualRequest.target)
    : sidebarText.rangeUnset;
  const invoiceCountDisplay = lastManualRequest
    ? String(lastManualRequest.invoices.length)
    : sidebarText.rangeUnset;
  const minInvoicesValue = lastManualRequest?.minInvoices;
  const maxInvoicesValue = lastManualRequest?.maxInvoices;
  const hasRange =
    lastManualRequest &&
    (minInvoicesValue !== undefined || maxInvoicesValue !== undefined);
  const rangeDisplay = hasRange
    ? `${minInvoicesValue ?? "—"} - ${maxInvoicesValue ?? "—"}`
    : sidebarText.rangeUnset;
  const requiredIdsList = lastManualRequest?.requiredInvoiceIds ?? [];
  const requiredDisplay =
    requiredIdsList.length > 0
      ? requiredIdsList.join(", ")
      : sidebarText.requiredEmpty;
  type SidebarTabKey = "summary" | "actions" | "scenarios" | "shortcuts";
  const [activeSidebarTab, setActiveSidebarTab] = useState<SidebarTabKey | null>(
    "summary"
  );
  const sidebarTabs: Array<{ key: SidebarTabKey; label: string }> = [
    { key: "summary", label: sidebarText.tabSummary },
    { key: "actions", label: sidebarText.tabActions },
    { key: "scenarios", label: sidebarText.tabScenarios },
    { key: "shortcuts", label: sidebarText.tabShortcuts },
  ];

  const renderSidebarContent = (tabKey: SidebarTabKey) => {
    if (tabKey === "summary") {
      return lastManualRequest ? (
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
            aria-current="page"
            className="inline-flex items-center justify-center rounded-full border border-brand bg-brand px-5 py-2 text-sm font-semibold text-white transition hover:bg-brand-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            {text.manualForm.title}
          </Link>
          <Link
            to="/upload"
            className="inline-flex items-center justify-center rounded-full border border-emerald-500 bg-white px-5 py-2 text-sm font-semibold text-emerald-600 transition hover:bg-emerald-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500"
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
        </div>
      );
    }

    if (tabKey === "scenarios") {
      if (savedScenarios.length === 0) {
        return (
          <p
            id="workspace-scenarios"
            className={`text-sm text-slate-500 ${
              isArabic ? "text-right" : "text-left"
            }`}
          >
            {text.saved.empty}
          </p>
        );
      }

      return (
        <div
          id="workspace-scenarios"
          className="space-y-3"
        >
          {savedScenarios.map((scenario) => {
            const amountText = formatAmount(Number(scenario.target));
            const isActiveScenario = activeScenarioId === scenario.id;
            return (
              <div
                key={scenario.id}
                className={`rounded-xl border bg-slate-50 p-4 shadow-sm transition ${
                  isActiveScenario
                    ? "border-brand shadow-brand/30"
                    : "border-slate-200"
                }`}
              >
                <div
                  className={`flex flex-col gap-2 ${
                    isArabic ? "text-right" : "text-left"
                  } md:flex-row md:items-center md:justify-between`}
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {scenario.name}
                    </p>
                    <p className="text-xs text-slate-500">
                      {(scenario.invoices.length === 1
                        ? text.saved.cardSummarySingle
                        : text.saved.cardSummaryPlural
                      )
                        .replace("{{amount}}", amountText)
                        .replace("{{count}}", String(scenario.invoices.length))}
                    </p>
                    {isActiveScenario && (
                      <span className="mt-1 inline-flex items-center rounded-full bg-brand/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-brand">
                        {text.saved.load}
                      </span>
                    )}
                  </div>
                  <div
                    className={`flex flex-wrap gap-2 ${
                      isArabic ? "justify-end" : "justify-start"
                    }`}
                >
                    <button
                      type="button"
                      onClick={() => handleLoadScenario(scenario)}
                      className="rounded-md border border-brand px-3 py-1 text-xs font-semibold text-brand transition hover:bg-brand/10"
                    >
                      {text.saved.load}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteScenario(scenario.id)}
                      className="rounded-md border border-red-200 px-3 py-1 text-xs font-semibold text-red-500 transition hover:bg-red-50"
                    >
                      {text.saved.delete}
                    </button>
                  </div>
                </div>
                {(scenario.requiredInvoiceIds ?? []).length > 0 && (
                  <p
                    className={`mt-2 text-xs text-slate-500 ${
                      isArabic ? "text-right" : "text-left"
                    }`}
                  >
                    {text.saved.requiresPrefix}
                    {(scenario.requiredInvoiceIds ?? []).join(", ")}
                  </p>
                )}
              </div>
            );
          })}
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


  const handleFeatureNavigate = useCallback((targetId: string) => {
    if (typeof document === "undefined") {
      return;
    }
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

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
              {lastManualRequest ? (
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
                  className="inline-flex w-full items-center justify-center rounded-full border border-emerald-500 bg-white px-5 py-2 text-sm font-semibold text-emerald-600 transition hover:bg-emerald-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500"
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
              </div>
            </section>

            <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-950/5">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                {text.saved.title}
              </h2>
              {savedScenarios.length === 0 ? (
                <p className="mt-3 text-sm text-slate-500">{text.saved.empty}</p>
              ) : (
                <div className="mt-3 space-y-3">
                  {savedScenarios.map((scenario) => {
                    const amountText = formatAmount(Number(scenario.target));
                    const isActiveScenario = activeScenarioId === scenario.id;
                    return (
                      <div
                        key={scenario.id}
                        className={`rounded-xl border bg-slate-50 p-4 shadow-sm transition ${
                          isActiveScenario
                            ? "border-brand shadow-brand/30"
                            : "border-slate-200"
                        }`}
                      >
                        <div className="flex flex-col gap-2">
                          <div>
                            <p className="text-sm font-semibold text-slate-900">
                              {scenario.name}
                            </p>
                            <p className="text-xs text-slate-500">
                              {(scenario.invoices.length === 1
                                ? text.saved.cardSummarySingle
                                : text.saved.cardSummaryPlural
                              )
                                .replace("{{amount}}", amountText)
                                .replace(
                                  "{{count}}",
                                  String(scenario.invoices.length)
                                )}
                            </p>
                            {isActiveScenario && (
                              <span className="mt-1 inline-flex items-center rounded-full bg-brand/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-brand">
                                {text.saved.load}
                              </span>
                            )}
                          </div>
                          {(scenario.requiredInvoiceIds ?? []).length > 0 && (
                            <p className="text-xs text-slate-500">
                              {text.saved.requiresPrefix}
                              {(scenario.requiredInvoiceIds ?? []).join(", ")}
                            </p>
                          )}
                        </div>
                        <div className="mt-3 flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => handleLoadScenario(scenario)}
                            className="flex-1 rounded-md border border-brand px-3 py-1 text-xs font-semibold text-brand transition hover:bg-brand/10"
                          >
                            {text.saved.load}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteScenario(scenario.id)}
                            className="flex-1 rounded-md border border-red-200 px-3 py-1 text-xs font-semibold text-red-500 transition hover:bg-red-50"
                          >
                            {text.saved.delete}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
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
            aria-labelledby="manual-entry-heading"
          >
            <h2
              id="manual-entry-heading"
              className="text-lg font-semibold text-slate-900 text-center"
            >
              {text.manualForm.title}
            </h2>
            <form
              className="mt-4 flex w-full flex-col gap-6 sm:mx-auto sm:max-w-2xl md:max-w-3xl"
              onSubmit={handleManualSubmit}
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <label className="block text-sm font-medium text-slate-700">
                    {text.manualForm.targetLabel}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    inputMode="decimal"
                    value={manualTarget}
                    onChange={(event) => setManualTarget(event.target.value)}
                    placeholder="e.g. 2500.00"
                    className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/40 md:text-base"
                  />
                </div>
                <div className="grid gap-2">
                  <label className="block text-sm font-medium text-slate-700">
                    {text.manualForm.minLabel}
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={manualMinInvoices}
                    onChange={(event) => setManualMinInvoices(event.target.value)}
                    placeholder={text.manualForm.optionalPlaceholder}
                    className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/40 md:text-base"
                  />
                </div>
                <div className="grid gap-2">
                  <label className="block text-sm font-medium text-slate-700">
                    {text.manualForm.maxLabel}
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={manualMaxInvoices}
                    onChange={(event) => setManualMaxInvoices(event.target.value)}
                    placeholder={text.manualForm.optionalPlaceholder}
                    className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/40 md:text-base"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">
                  {text.manualForm.requiredLabel}
                </label>
                <input
                  type="text"
                  value={manualRequiredIds}
                  onChange={(event) => setManualRequiredIds(event.target.value)}
                  placeholder="INV-001, INV-010"
                  className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/40 md:text-base"
                />
                <p className="mt-1 text-xs text-slate-500">
                  {text.manualForm.requiredHelper}
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-slate-700">
                    {text.manualForm.invoiceSectionLabel}
                  </label>
                  <button
                    type="button"
                    onClick={addInvoiceField}
                    className="text-sm font-medium text-brand transition hover:text-brand-dark"
                  >
                    {text.manualForm.addInvoice}
                  </button>
                </div>

                <div className="space-y-2">
                  {invoices.map((value, index) => (
                    <div
                      key={index}
                      className="grid gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-3 shadow-inner md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]"
                    >
                      <input
                        type="text"
                        value={value.id}
                        onChange={(event) =>
                          handleInvoiceFieldChange(index, "id", event.target.value)
                        }
                        placeholder={`${text.manualForm.invoicePlaceholderLabel} ${index + 1}`}
                        className="w-full border-none bg-white px-3 py-2 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand/40 md:px-2 md:py-1.5"
                      />
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        inputMode="decimal"
                        value={value.amount}
                        onChange={(event) =>
                          handleInvoiceFieldChange(
                            index,
                            "amount",
                            event.target.value
                          )
                        }
                        placeholder={text.manualForm.amountPlaceholder}
                        className="w-full border-none bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand/40 md:px-2 md:py-1.5 md:text-base"
                      />
                      {invoices.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeInvoiceField(index)}
                          className="rounded-md px-2 py-1 text-xs font-semibold text-slate-500 transition hover:bg-slate-200 hover:text-slate-700"
                          aria-label={text.manualForm.remove}
                        >
                          {text.manualForm.remove}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {manualError && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {manualError}
                </div>
              )}

              <div className="flex justify-center">
                <button
                  type="submit"
                  disabled={manualLoading}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-brand px-6 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-not-allowed disabled:bg-brand/50 sm:px-8 sm:text-base"
                >
                  {manualLoading ? text.manualForm.submitting : text.manualForm.submit}
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
                  onClick={handleExport}
                  disabled={!canExport}
                  className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500 disabled:cursor-not-allowed disabled:bg-emerald-300 sm:px-6 sm:text-base"
                >
                  {isExporting ? text.results.exporting : text.results.exportCsv}
                </button>
              </div>
              <div className="hidden lg:flex items-center gap-3">
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
                  onClick={handleExport}
                  disabled={!canExport}
                  className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500 disabled:cursor-not-allowed disabled:bg-emerald-300"
                >
                  {isExporting ? text.results.exporting : text.results.exportCsv}
                </button>
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

        </div>

      </div>
    </div>
  );
};

export default FeaturesPage;
