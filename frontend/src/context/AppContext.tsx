/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  translations,
} from "../translations";
import type {
  Language,
  SavedScenario,
  LastRequest,
  Translation,
} from "../types";

type AppContextValue = {
  language: Language;
  setLanguage: (lang: Language) => void;
  translations: Translation;
  isArabic: boolean;
  savedScenarios: SavedScenario[];
  setSavedScenarios: (next: SavedScenario[]) => void;
  lastRequest: LastRequest | null;
  setLastRequest: (request: LastRequest | null) => void;
  lastRequestSource: "manual" | "excel" | null;
  setLastRequestSource: (source: "manual" | "excel" | null) => void;
};

const AppContext = createContext<AppContextValue | undefined>(undefined);

const loadScenarios = (): SavedScenario[] => {
  if (typeof window === "undefined") {
    return [];
  }
  try {
    const raw = window.localStorage.getItem("invoice-mix-scenarios");
    if (!raw) return [];
    const parsed = JSON.parse(raw) as SavedScenario[];
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed.map((scenario) => ({
      ...scenario,
      invoices: Array.isArray(scenario.invoices)
        ? scenario.invoices.map((invoice) => ({ ...invoice }))
        : [],
      requiredInvoiceIds: Array.isArray(scenario.requiredInvoiceIds)
        ? scenario.requiredInvoiceIds
        : [],
    }));
  } catch {
    return [];
  }
};

const persistScenarios = (scenarios: SavedScenario[]) => {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(
    "invoice-mix-scenarios",
    JSON.stringify(scenarios)
  );
};

export function AppProviders({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");
  const [savedScenarios, setSavedScenariosState] = useState<SavedScenario[]>(
    loadScenarios
  );
  const [lastRequest, setLastRequest] = useState<LastRequest | null>(null);
  const [lastRequestSource, setLastRequestSource] = useState<
    "manual" | "excel" | null
  >(null);

  const translationBundle = useMemo(() => translations[language], [language]);

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = language;
      document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
    }
  }, [language]);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
  }, []);

  const setSavedScenarios = useCallback((next: SavedScenario[]) => {
    setSavedScenariosState(next);
    persistScenarios(next);
  }, []);

  const value: AppContextValue = {
    language,
    setLanguage,
    translations: translationBundle,
    isArabic: language === "ar",
    savedScenarios,
    setSavedScenarios,
    lastRequest,
    setLastRequest,
    lastRequestSource,
    setLastRequestSource,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error("useAppContext must be used within AppProviders");
  }
  return ctx;
}
