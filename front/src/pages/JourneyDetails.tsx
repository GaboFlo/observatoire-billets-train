import {
  ArrowLeft,
  ArrowRightLeft,
  Calendar,
  ChartBar,
  ChartLine,
  Train,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import LoadingAnimation from "../components/LoadingAnimation";
import PriceEvolutionChart from "../components/PriceEvolutionChart";
import StatCard from "../components/StatCard";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import UnifiedFilters from "../components/UnifiedFilters";
import { useJourneyDetails } from "../hooks/useJourneyDetails";
import { useJourneyDetailsFilters } from "../hooks/useJourneyDetailsFilters";
import { truncatePrice } from "../lib/utils";

const JourneyDetails = () => {
  const {
    departureStation,
    arrivalStation,
    departureStationId,
    arrivalStationId,
  } = useParams<{
    departureStation: string;
    arrivalStation: string;
    departureStationId: string;
    arrivalStationId: string;
  }>();
  const navigate = useNavigate();

  const {
    journey,
    detailedOffers,
    loading,
    filterLoading,
    error,
    analysisDates,
    selectedDate,
    availableTrains,
    selectedTrain,
    selectedCarriers,
    selectedClasses,
    selectedDiscountCards,
    availableCarriers,
    availableClasses,
    availableDiscountCards,
    handleDateSelect,
    handleTrainSelect,
    handleCarrierToggle,
    handleClassToggle,
    handleDiscountCardToggle,
  } = useJourneyDetails(
    departureStation || "",
    arrivalStation || "",
    [],
    departureStationId ? parseInt(departureStationId) : undefined,
    arrivalStationId ? parseInt(arrivalStationId) : undefined
  );

  const { filteredOffers } = useJourneyDetailsFilters(detailedOffers);

  // Logs de débogage
  console.log("🔍 JourneyDetails - analysisDates:", analysisDates.length);
  console.log("🔍 JourneyDetails - selectedDate:", selectedDate);
  console.log("🔍 JourneyDetails - availableTrains:", availableTrains.length);
  console.log("🔍 JourneyDetails - selectedTrain:", selectedTrain);
  console.log("🔍 JourneyDetails - error:", error);
  console.log("🔍 JourneyDetails - loading:", loading);
  console.log("🔍 JourneyDetails - filterLoading:", filterLoading);

  const handleInvertJourney = () => {
    console.log("🔄 Inversion du trajet");

    // Construire la nouvelle URL avec les stations inversées
    const newUrl = `/journey/${arrivalStation}/${departureStation}/${arrivalStationId}/${departureStationId}`;
    console.log("🔄 Navigation vers:", newUrl);
    navigate(newUrl);
  };

  if (loading) {
    return <LoadingAnimation />;
  }

  // Afficher un message si aucune date n'est disponible
  if (analysisDates.length === 0 && !loading && !error && !filterLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container px-4 py-8 mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center">
              <Button variant="outline" size="sm" asChild className="mr-4">
                <Link to="/">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Retour
                </Link>
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-1">
                  {departureStation} ⟶ {arrivalStation}
                </h1>
                <p className="text-gray-500 text-sm"></p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleInvertJourney}
              className="flex items-center gap-2"
            >
              <ArrowRightLeft className="h-4 w-4" />
              Inverser le trajet
            </Button>
          </div>
          <div className="text-center py-16">
            <Calendar className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h2 className="text-2xl font-semibold text-gray-700 mb-2">
              Aucune date disponible
            </h2>
            <p className="text-gray-500 mb-8">
              Aucune date n'a été trouvée pour ce trajet. Vérifiez les
              paramètres ou essayez un autre trajet.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container px-4 py-8 mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center">
              <Button variant="outline" size="sm" asChild className="mr-4">
                <Link to="/">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Retour
                </Link>
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-1">
                  {departureStation} ⟶ {arrivalStation}
                </h1>
                <p className="text-gray-500 text-sm"></p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleInvertJourney}
              className="flex items-center gap-2"
            >
              <ArrowRightLeft className="h-4 w-4" />
              Inverser le trajet
            </Button>
          </div>
          <div className="text-center py-16">
            <div className="text-red-500 mb-4">
              <svg
                className="mx-auto h-16 w-16"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-gray-700 mb-2">
              Erreur de chargement
            </h2>
            <p className="text-gray-500 mb-8">
              {error} <br />
              Attention à la réouverture des portes en réessayant{" "}
            </p>
            <Button onClick={() => window.location.reload()}>Réessayer</Button>
          </div>
        </div>
      </div>
    );
  }

  // Calculer la variation (pour l'instant, on utilise une valeur fixe car nous n'avons pas d'historique temporel)
  const monthlyChange = 0; // À remplacer par un calcul réel quand l'historique sera disponible

  return (
    <>
      {filterLoading && <LoadingAnimation isFilterLoading={true} />}
      <div className="min-h-screen bg-gray-50">
        <div className="container px-4 py-8 mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center">
              <Button variant="outline" size="sm" asChild className="mr-4">
                <Link to="/">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Retour
                </Link>
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-1">
                  {departureStation} ⟶ {arrivalStation}
                </h1>
                <p className="text-gray-500 text-sm"></p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleInvertJourney}
              className="flex items-center gap-2"
            >
              <ArrowRightLeft className="h-4 w-4" />
              Inverser le trajet
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 space-y-6">
              {/* Filtres unifiés */}
              <UnifiedFilters
                availableDates={analysisDates}
                availableTrains={availableTrains}
                availableCarriers={availableCarriers}
                availableClasses={availableClasses}
                availableDiscountCards={availableDiscountCards}
                selectedDate={selectedDate}
                selectedTrain={selectedTrain}
                selectedCarriers={selectedCarriers}
                selectedClasses={selectedClasses}
                selectedDiscountCards={selectedDiscountCards}
                onDateSelect={(date) => handleDateSelect(date || "")}
                onTrainSelect={(train) => handleTrainSelect(train || "")}
                onCarrierToggle={handleCarrierToggle}
                onClassToggle={handleClassToggle}
                onDiscountCardToggle={handleDiscountCardToggle}
                onInvertJourney={handleInvertJourney}
                loading={loading}
                filterLoading={filterLoading}
              />
            </div>

            <div className="lg:col-span-2 space-y-8">
              {/* Bandeau unifié d'analyse */}
              <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 rounded-xl">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <ChartBar className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="text-sm text-blue-800">
                        <span className="font-semibold">
                          Analyse actuelle :
                        </span>{" "}
                        {!selectedDate ? (
                          <span>Statistiques générales du trajet</span>
                        ) : !selectedTrain ? (
                          <span>
                            Statistiques pour le{" "}
                            {new Date(selectedDate).toLocaleDateString("fr-FR")}
                          </span>
                        ) : (
                          <span>
                            Train {selectedTrain} du{" "}
                            {new Date(selectedDate).toLocaleDateString("fr-FR")}
                          </span>
                        )}
                      </div>
                    </div>
                    {selectedTrain && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleTrainSelect("")}
                        className="text-blue-600 hover:text-blue-800 hover:bg-blue-100"
                      >
                        Voir tous les trains
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* KPIs et statistiques */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {" "}
                <StatCard
                  title="Prix Minimum"
                  value={`${truncatePrice(journey?.minPrice || 0)}€`}
                  description="Le tarif le plus bas observé"
                  icon={TrendingDown}
                  color="green"
                />
                <StatCard
                  title="Prix Moyen"
                  value={`${truncatePrice(journey?.avgPrice || 0)}€`}
                  description="Prix moyen des offres disponibles"
                  icon={ChartLine}
                  color="blue"
                />
                <StatCard
                  title="Prix Maximum"
                  value={`${truncatePrice(journey?.maxPrice || 0)}€`}
                  description="Le tarif le plus élevé observé"
                  icon={TrendingUp}
                  color="orange"
                />
              </div>

              {/* Contenu conditionnel selon la sélection */}
              {!selectedDate && (
                <div className="text-center py-16">
                  <Calendar className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                  <p className="text-gray-500 mb-8">
                    Sélectionnez une date pour affiner l'analyse.
                  </p>
                </div>
              )}

              {selectedDate && !selectedTrain && (
                <div className="text-center py-16">
                  <Train className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                  <h2 className="text-2xl font-semibold text-gray-700 mb-2">
                    Statistiques de la date
                  </h2>
                  <p className="text-gray-500 mb-8">
                    Affichage des statistiques pour le{" "}
                    {new Date(selectedDate).toLocaleDateString("fr-FR")}.
                    Sélectionnez un train spécifique pour une analyse détaillée.
                  </p>
                  <PriceEvolutionChart offers={filteredOffers} />
                </div>
              )}

              {selectedDate && selectedTrain && (
                <>
                  <div className="text-center py-8">
                    <h2 className="text-xl font-semibold text-gray-700 mb-2">
                      Analyse détaillée du train {selectedTrain}
                    </h2>
                    <p className="text-gray-500">
                      Statistiques spécifiques pour le train {selectedTrain} du{" "}
                      {new Date(selectedDate).toLocaleDateString("fr-FR")}
                    </p>
                  </div>
                  <PriceEvolutionChart offers={filteredOffers} />
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default JourneyDetails;
