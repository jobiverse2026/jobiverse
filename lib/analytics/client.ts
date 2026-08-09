type AnalyticsParameters = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (command: "event", name: string, parameters?: AnalyticsParameters) => void;
  }
}

const consentKey = "jobiverse-cookie-consent-v1";

export function hasAnalyticsConsent() {
  if (typeof window === "undefined") return false;
  try {
    const saved = window.localStorage.getItem(consentKey);
    return Boolean(saved && JSON.parse(saved)?.analytics === true);
  } catch {
    return false;
  }
}

export function trackEvent(name: string, parameters: AnalyticsParameters = {}) {
  if (!hasAnalyticsConsent()) return;
  if (window.gtag) {
    window.gtag("event", name, parameters);
    return;
  }
  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push({ event: name, ...parameters });
}