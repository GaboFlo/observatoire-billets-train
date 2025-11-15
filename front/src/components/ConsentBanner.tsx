import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { useMatomo } from "../hooks/useMatomo";
import { trackConsentAction } from "../utils/matomoTracking";

const MATOMO_URL = import.meta.env.VITE_MATOMO_URL || "";
const MATOMO_SITE_ID = Number(import.meta.env.VITE_MATOMO_SITE_ID) || 0;

const ConsentBanner = () => {
  const { hasConsent, acceptConsent, rejectConsent } = useMatomo();
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const consent = hasConsent();
    if (consent === null && MATOMO_URL && MATOMO_SITE_ID) {
      setShowBanner(true);
    }
  }, [hasConsent]);

  const handleAccept = () => {
    acceptConsent({ url: MATOMO_URL, siteId: MATOMO_SITE_ID });
    setTimeout(() => {
      trackConsentAction("accept");
    }, 100);
    setShowBanner(false);
  };

  const handleReject = () => {
    rejectConsent();
    setShowBanner(false);
  };

  if (!showBanner || !MATOMO_URL || !MATOMO_SITE_ID) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-gray-900 text-white shadow-lg border-t border-gray-700">
      <div className="container mx-auto px-4 py-4 max-w-7xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex-1">
            <p className="text-sm">
              Nous utilisons Matomo pour analyser l'utilisation de ce site et
              améliorer votre expérience. Les données collectées sont
              anonymisées et hébergées sur nos propres serveurs. En continuant
              à naviguer, vous acceptez l'utilisation de cookies à des fins
              d'analyse.
            </p>
            <p className="text-xs mt-2 text-gray-400">
              Vous pouvez retirer votre consentement à tout moment en supprimant
              le cookie de consentement dans les paramètres de votre navigateur.
            </p>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <Button
              onClick={handleReject}
              variant="outline"
              className="bg-transparent border-gray-600 text-white hover:bg-gray-800"
            >
              Refuser
            </Button>
            <Button
              onClick={handleAccept}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Accepter
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConsentBanner;

