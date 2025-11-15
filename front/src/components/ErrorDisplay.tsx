import { trackError } from "@/utils/matomoTracking";
import { AlertCircle, RefreshCw } from "lucide-react";
import { useEffect } from "react";
import { Button } from "./ui/button";

interface ErrorDisplayProps {
  error: string;
  status?: number;
}

const ErrorDisplay = ({ error, status }: ErrorDisplayProps) => {
  useEffect(() => {
    trackError("Erreur affichée", error);
  }, [error]);

  const handleRefresh = () => {
    window.location.reload();
  };

  const isRateLimitError = status === 429 || error.includes("Trop de requêtes");

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-pink-50 flex items-center justify-center">
      <div className="text-center space-y-8 max-w-md mx-auto px-4">
        {/* Error icon */}
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-red-500 to-pink-600 rounded-2xl mb-6">
          <AlertCircle className="w-10 h-10 text-white" />
        </div>

        {/* Error message */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900">
            {isRateLimitError ? (
              <>
                Oups ! <br />
                Trop de requêtes, votre train est en attente de signalisation.
                <br />
                Veuillez patienter quelques instants avant de réessayer.
              </>
            ) : (
              <>
                Oups ! <br />
                Ton train est resté à quai pour une raison inconnue, <br />
                mais pas de G30 ici, désolé...
              </>
            )}
          </h2>
          {!isRateLimitError && (
            <p className="text-gray-600 leading-relaxed">{error}</p>
          )}
          {isRateLimitError && (
            <p className="text-gray-600 leading-relaxed">
              {error}
              <br />
              <span className="text-sm text-gray-500 mt-2 block">
                Cette limitation permet de garantir la disponibilité du service
                pour tous les utilisateurs.
              </span>
            </p>
          )}
        </div>

        {/* Action buttons */}
        <div className="space-y-4">
          <Button
            onClick={handleRefresh}
            className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-6 py-3 rounded-xl font-medium"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Réessayer
          </Button>

          <p className="text-sm text-gray-500">
            Si le problème persiste, vérifiez votre connexion internet
          </p>
        </div>
      </div>
    </div>
  );
};

export default ErrorDisplay;
