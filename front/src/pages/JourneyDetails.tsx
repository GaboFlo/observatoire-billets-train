import { stationTranslations, translateStation } from "@/utils/translations";
import {
  ArrowLeft,
  ArrowRightLeft,
  Calendar,
  ChartLine,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import FilterCollapseButton from "../components/FilterCollapseButton";
import Filters from "../components/Filters";
import Footer from "../components/Footer";
import LoadingAnimation from "../components/LoadingAnimation";
import StatCard from "../components/StatCard";
import StatisticsChart from "../components/StatisticsChart";
import { Button } from "../components/ui/button";
import { useFiltersCollapsed } from "../hooks/useFiltersCollapsed";
import { DEFAULT_FILTERS } from "../hooks/useGlobalFilters";
import { useJourneyDetails } from "../hooks/useJourneyDetails";
import { useJourneyDetailsFilters } from "../hooks/useJourneyDetailsFilters";
import {
  buildJourneyUrl,
  parseStationWithId,
  truncatePrice,
} from "../lib/utils";

const resetCarriers = (
  selectedCarriers: string[],
  handleCarrierToggle: (carrier: string) => void
) => {
  DEFAULT_FILTERS.carriers.forEach((carrier) => {
    if (!selectedCarriers.includes(carrier)) {
      handleCarrierToggle(carrier);
    }
  });
  selectedCarriers.forEach((carrier) => {
    if (!DEFAULT_FILTERS.carriers.includes(carrier)) {
      handleCarrierToggle(carrier);
    }
  });
};

const resetDiscountCards = (
  selectedDiscountCards: string[],
  handleDiscountCardToggle: (card: string) => void
) => {
  if (!selectedDiscountCards.includes("NONE")) {
    handleDiscountCardToggle("NONE");
  }
  selectedDiscountCards.forEach((card) => {
    if (card !== "NONE") {
      handleDiscountCardToggle(card);
    }
  });
};

interface EmptyStateProps {
  departureStation: string;
  arrivalStation: string;
  onInvertJourney: () => void;
}

const EmptyState = ({
  departureStation,
  arrivalStation,
  onInvertJourney,
}: EmptyStateProps) => {
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
                {departureStation
                  ? stationTranslations[departureStation]
                  : "Station de départ"}{" "}
                ⟶{" "}
                {arrivalStation
                  ? stationTranslations[arrivalStation]
                  : "Station d'arrivée"}
              </h1>
              <p className="text-gray-500 text-sm"></p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onInvertJourney}
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
            Aucune date n'a été trouvée pour ce trajet. Vérifiez les paramètres
            ou essayez un autre trajet.
          </p>
        </div>
      </div>
    </div>
  );
};

interface ErrorStateProps {
  departureStation: string;
  arrivalStation: string;
  error: string;
  onInvertJourney: () => void;
}

const ErrorState = ({
  departureStation,
  arrivalStation,
  error,
  onInvertJourney,
}: ErrorStateProps) => {
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
                {departureStation
                  ? stationTranslations[departureStation]
                  : "Station de départ"}{" "}
                ⟶{" "}
                {arrivalStation
                  ? stationTranslations[arrivalStation]
                  : "Station d'arrivée"}
              </h1>
              <p className="text-gray-500 text-sm"></p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onInvertJourney}
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
            Certainement une panne de signalisation, rafraîchissez la page pour
            ne pas louper vos correspondances{" "}
          </p>
          <Button onClick={() => globalThis.location.reload()}>
            Réessayer
          </Button>
        </div>
      </div>
    </div>
  );
};

const JourneyDetails = () => {
  const { departureStationWithId, arrivalStationWithId } = useParams<{
    departureStationWithId: string;
    arrivalStationWithId: string;
  }>();
  const navigate = useNavigate();

  const departureParsed = departureStationWithId
    ? parseStationWithId(departureStationWithId)
    : null;
  const arrivalParsed = arrivalStationWithId
    ? parseStationWithId(arrivalStationWithId)
    : null;

  const departureStation = departureParsed?.station ?? "";
  const arrivalStation = arrivalParsed?.station ?? "";
  const departureStationId = departureParsed?.id;
  const arrivalStationId = arrivalParsed?.id;

  const {
    detailedOffers,
    calculatedStats,
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
    selectedFlexibilities,
    availableCarriers,
    availableClasses,
    availableDiscountCards,
    availableFlexibilities,
    handleDateSelect,
    handleTrainSelect,
    handleCarrierToggle,
    handleClassToggle,
    handleDiscountCardToggle,
    handleFlexibilityToggle,
  } = useJourneyDetails(
    departureStation,
    arrivalStation,
    [],
    departureStationId,
    arrivalStationId
  );

  const { filteredOffers } = useJourneyDetailsFilters(detailedOffers);

  const handleInvertJourney = () => {
    if (arrivalStationId && departureStationId) {
      const newDepartureStation = arrivalStation;
      const newArrivalStation = departureStation;
      const newDepartureStationId = arrivalStationId;
      const newArrivalStationId = departureStationId;
      const newUrl = buildJourneyUrl(
        newDepartureStation,
        newArrivalStation,
        newDepartureStationId,
        newArrivalStationId
      );
      navigate(newUrl);
    }
  };

  // Fonction pour reset les filtres
  const handleResetFilters = () => {
    resetCarriers(selectedCarriers, handleCarrierToggle);
    if (!selectedClasses.includes("economy")) {
      handleClassToggle("economy");
    }
    resetDiscountCards(selectedDiscountCards, handleDiscountCardToggle);
    selectedFlexibilities.forEach((flex) => {
      if (selectedFlexibilities.includes(flex)) {
        handleFlexibilityToggle(flex);
      }
    });
    handleDateSelect(null);
    handleTrainSelect("");
  };

  const { filtersCollapsed, expandFilters } = useFiltersCollapsed();

  if (loading) {
    return <LoadingAnimation />;
  }

  const isEmptyState =
    analysisDates.length === 0 &&
    !loading &&
    !error &&
    !filterLoading &&
    departureStation &&
    arrivalStation;

  if (isEmptyState) {
    return (
      <EmptyState
        departureStation={departureStation}
        arrivalStation={arrivalStation}
        onInvertJourney={handleInvertJourney}
      />
    );
  }

  if (error) {
    return (
      <ErrorState
        departureStation={departureStation}
        arrivalStation={arrivalStation}
        error={error}
        onInvertJourney={handleInvertJourney}
      />
    );
  }

  // Calculer la variation (pour l'instant, on utilise une valeur fixe car nous n'avons pas d'historique temporel)
  const monthlyChange = 0; // À remplacer par un calcul réel quand l'historique sera disponible

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="w-full pt-6 pb-4">
        <div className="max-w-7xl mx-auto px-4">
          <div className="mb-4 relative min-h-[60px] flex items-center">
            <div className="absolute left-0 top-1/2 -translate-y-1/2">
              <Button variant="outline" size="sm" asChild>
                <Link to="/">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Retour
                </Link>
              </Button>
            </div>
            <div className="absolute right-0 top-1/2 -translate-y-1/2">
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
            <div className="text-center w-full">
              <h1 className="text-3xl font-bold mb-1 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                {departureStation
                  ? translateStation(departureStation)
                  : "Station de départ"}{" "}
                ⟶{" "}
                {arrivalStation
                  ? translateStation(arrivalStation)
                  : "Station d'arrivée"}
              </h1>
              <p className="text-sm text-gray-500 mb-0"></p>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full px-4 pb-8">
        <div className="flex flex-col lg:flex-row gap-6 relative">
          {filtersCollapsed && (
            <FilterCollapseButton onExpand={expandFilters} />
          )}
          {/* Sidebar de filtres - max 1/3 sur desktop */}
          <div
            className={`transition-all duration-300 ease-in-out ${
              filtersCollapsed
                ? "lg:w-0 lg:max-w-0 lg:overflow-hidden lg:opacity-0 lg:pointer-events-none"
                : "lg:w-1/3 lg:max-w-md lg:opacity-100 lg:pointer-events-auto"
            } lg:sticky lg:top-4 lg:self-start`}
            style={{
              willChange: "opacity, width",
            }}
          >
            {/* Filtres */}
            <Filters
              availableDates={analysisDates}
              availableTrains={availableTrains}
              availableCarriers={availableCarriers}
              availableClasses={availableClasses}
              availableDiscountCards={availableDiscountCards}
              availableFlexibilities={availableFlexibilities}
              selectedDate={selectedDate}
              selectedTrain={selectedTrain}
              selectedCarriers={selectedCarriers}
              selectedClasses={selectedClasses}
              selectedDiscountCards={selectedDiscountCards}
              selectedFlexibilities={selectedFlexibilities}
              onDateSelect={handleDateSelect}
              onTrainSelect={(train) => handleTrainSelect(train ?? "")}
              onCarrierToggle={handleCarrierToggle}
              onClassToggle={handleClassToggle}
              onDiscountCardToggle={handleDiscountCardToggle}
              onFlexibilityToggle={handleFlexibilityToggle}
              onInvertJourney={handleInvertJourney}
              onResetFilters={handleResetFilters}
              loading={loading}
              filterLoading={filterLoading}
            />
          </div>

          {/* Contenu principal - prend toute la largeur si filtres collapsés */}
          <div
            className={`flex-1 space-y-8 sticky top-4 z-10 max-h-[calc(100vh-2rem)] overflow-y-auto`}
            style={{
              willChange: "width",
            }}
          >
            <div className="bg-gray-50 rounded-lg">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <StatCard
                  title="Prix minimum"
                  value={`${truncatePrice(calculatedStats.minPrice)}€`}
                  description="Le tarif le plus bas observé"
                  icon={TrendingDown}
                  color="green"
                />
                <StatCard
                  title="Prix moyen à J-7"
                  value={`${truncatePrice(calculatedStats.avgPrice)}€`}
                  description="Prix moyen des offres disponibles à J-7"
                  icon={ChartLine}
                  color="blue"
                  tooltipText="Si disponible, sinon, moyenne sur toutes les données filtrées"
                />
                <StatCard
                  title="Prix maximum"
                  value={`${truncatePrice(calculatedStats.maxPrice)}€`}
                  description="Le tarif le plus élevé observé"
                  icon={TrendingUp}
                  color="red"
                />
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg">
              <StatisticsChart
                offers={filteredOffers}
                selectedDate={selectedDate}
                selectedTrain={selectedTrain}
                selectedCarriers={selectedCarriers}
                selectedClasses={selectedClasses}
                selectedDiscountCards={selectedDiscountCards}
                selectedFlexibilities={selectedFlexibilities}
                availableTrains={availableTrains}
                availableCarriers={availableCarriers}
                availableClasses={availableClasses}
                availableDiscountCards={availableDiscountCards}
                loading={filterLoading}
              />
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default JourneyDetails;
