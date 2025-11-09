export type Language = "en" | "fr" | "ar";

export type Translation = {
  nav: {
    features: string;
    upload: string;
    about: string;
    tips: string;
    languageLabel: string;
  };
  languages: Record<Language, string>;
  header: {
    tagline: string;
    description: string;
    carousel: string[];
    carouselAria: string;
    carouselTitles?: string[];
    homeLinkAria: string;
  };
  sidebar: {
    lastRunTitle: string;
    lastRunEmpty: string;
    targetLabel: string;
    invoiceCountLabel: string;
    rangeLabel: string;
    rangeUnset: string;
    requiredLabel: string;
    requiredEmpty: string;
    quickActionsTitle: string;
    tipsTitle: string;
    tips: string[];
    savedCta: string;
    tabSummary: string;
    tabActions: string;
    tabTips: string;
    tabShortcuts: string;
    tabScenarios: string;
  };
  sidebarLeft: {
    title: string;
    features: { id: string; title: string; description: string }[];
  };
  manualForm: {
    title: string;
    targetLabel: string;
    minLabel: string;
    maxLabel: string;
    requiredLabel: string;
    requiredHelper: string;
    invoiceSectionLabel: string;
    addInvoice: string;
    invoicePlaceholderLabel: string;
    amountPlaceholder: string;
    remove: string;
    submit: string;
    submitting: string;
    optionalPlaceholder: string;
  };
  excelForm: {
    title: string;
    targetLabel: string;
    minLabel: string;
    maxLabel: string;
    requiredLabel: string;
    requiredHelper: string;
    fileLabel: string;
    fileHint: string;
    selectedFileLabel: string;
    submit: string;
    processing: string;
  };
  results: {
    title: string;
    introIdle: string;
    introEmpty: string;
    introFoundSingle: string;
    introFoundPlural: string;
    combinationLabelPrefix: string;
    totalLabel: string;
    noResultsHelp: string;
    saveScenario: string;
    exportCsv: string;
    exporting: string;
  };
  saved: {
    title: string;
    countLabelSingle: string;
    countLabelPlural: string;
    defaultNamePrefix: string;
    prompt: string;
    load: string;
    delete: string;
    requiresPrefix: string;
    cardSummarySingle: string;
    cardSummaryPlural: string;
    empty: string;
  };
  about: { title: string; intro: string; bullets: string[]; closing: string };
  footer: {
    tagline: string;
    copyright: string;
  };
  errors: {
    targetPositive: string;
    minPositive: string;
    maxPositive: string;
    minLessThanMax: string;
    uploadFileRequired: string;
    numbersPositive: string;
    duplicateIdTemplate: string;
    missingFields: string;
    addInvoices: string;
    fetchFailed: string;
    manualUnexpected: string;
    uploadFailed: string;
    excelUnexpected: string;
    runSearchBeforeSave: string;
    runSearchBeforeExport: string;
    exportInvalidTarget: string;
    exportNoInvoices: string;
    exportUnexpected: string;
  };
  languageSelectorAria: string;
};

export type InvoiceFormEntry = {
  id: string;
  amount: string;
};

export type CombinationFiltersRequest = {
  minInvoices?: number;
  maxInvoices?: number;
  requiredInvoiceIds: string[];
};

export type SavedScenario = CombinationFiltersRequest & {
  id: string;
  name: string;
  target: string;
  invoices: InvoiceFormEntry[];
};

export type LastRequest = CombinationFiltersRequest & {
  target: string;
  invoices: InvoiceFormEntry[];
};

export type CombinationResponse = {
  combinations: string[][];
  combinationCount: number;
  invoiceAmounts: Record<string, number | string>;
};
