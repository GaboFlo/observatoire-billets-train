import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useMatomo } from "../hooks/useMatomo";

const MATOMO_URL = import.meta.env.VITE_MATOMO_URL || "";
const MATOMO_SITE_ID = Number(import.meta.env.VITE_MATOMO_SITE_ID) || 0;

const MatomoTracker = () => {
  const location = useLocation();
  const { initMatomo, trackPageView, hasConsent } = useMatomo();

  useEffect(() => {
    if (MATOMO_URL && MATOMO_SITE_ID) {
      initMatomo({ url: MATOMO_URL, siteId: MATOMO_SITE_ID });
    }
  }, [initMatomo]);

  useEffect(() => {
    if (hasConsent() === true) {
      trackPageView();
    }
  }, [location.pathname, location.search, trackPageView, hasConsent]);

  return null;
};

export default MatomoTracker;

