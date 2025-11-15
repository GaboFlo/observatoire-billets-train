import { useEffect, useRef } from "react";

const CONSENT_STORAGE_KEY = "matomo_consent";
const MATOMO_SCRIPT_ID = "matomo-tracker";

interface MatomoConfig {
  url: string;
  siteId: number;
}

declare global {
  interface Window {
    _paq?: unknown[][];
  }
}

const getConsent = (): boolean | null => {
  const stored = localStorage.getItem(CONSENT_STORAGE_KEY);
  if (stored === null) return null;
  return stored === "true";
};

const setConsent = (consent: boolean): void => {
  localStorage.setItem(CONSENT_STORAGE_KEY, String(consent));
};

const loadMatomoScript = (config: MatomoConfig): void => {
  if (document.getElementById(MATOMO_SCRIPT_ID)) return;

  window._paq = window._paq || [];

  const script = document.createElement("script");
  script.id = MATOMO_SCRIPT_ID;
  script.async = true;
  script.src = `${config.url}/matomo.js`;
  document.head.appendChild(script);

  window._paq.push(["setSiteId", config.siteId]);
  window._paq.push(["setTrackerUrl", `${config.url}/matomo.php`]);
  window._paq.push(["enableLinkTracking"]);
};

const trackPageView = (): void => {
  if (window._paq) {
    window._paq.push(["trackPageView"]);
  }
};

const setConsentTracking = (consent: boolean): void => {
  if (window._paq) {
    if (consent) {
      window._paq.push(["setConsentGiven"]);
      window._paq.push(["rememberConsentGiven", true]);
    } else {
      window._paq.push(["forgetConsentGiven"]);
    }
  }
};

export const useMatomo = () => {
  const initializedRef = useRef(false);

  const initMatomo = (config: MatomoConfig): void => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    const consent = getConsent();
    if (consent === true) {
      loadMatomoScript(config);
      setConsentTracking(true);
    }
  };

  const acceptConsent = (config: MatomoConfig): void => {
    setConsent(true);
    if (!initializedRef.current) {
      loadMatomoScript(config);
    }
    setConsentTracking(true);
    trackPageView();
  };

  const rejectConsent = (): void => {
    setConsent(false);
    setConsentTracking(false);
  };

  const hasConsent = (): boolean | null => {
    return getConsent();
  };

  return {
    initMatomo,
    acceptConsent,
    rejectConsent,
    hasConsent,
    trackPageView,
  };
};

export const trackEvent = (
  category: string,
  action: string,
  name?: string,
  value?: number
): void => {
  if (window._paq && getConsent() === true) {
    const event: unknown[] = ["trackEvent", category, action];
    if (name) event.push(name);
    if (value !== undefined) event.push(value);
    window._paq.push(event);
  }
};

