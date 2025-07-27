import { useState, useMemo } from "react";
import JourneyCard from "./JourneyCard";
import TrainMap from "./TrainMap";
import GlobalFilters from "./GlobalFilters";
import { GroupedJourney } from "@/types/journey";
import { useGlobalFilters } from "@/hooks/useGlobalFilters";

interface JourneysTabProps {
  journeys: GroupedJourney[];
}

const JourneysTab = ({ journeys }: JourneysTabProps) => {
  const [selectedRouteJourneyIds, setSelectedRouteJourneyIds] = useState<string[]>([]);
  
  const {
    filters,
    availableOptions,
    filteredJourneys,
    handleCarrierFilter,
    handleClassFilter,
    handleDiscountCardFilter,
    clearFilters,
  } = useGlobalFilters(journeys);

  // Filtrer les trajets selon la sélection de route
  const displayJourneys = useMemo(() => {
    if (selectedRouteJourneyIds.length === 0) {
      return filteredJourneys;
    }
    return filteredJourneys.filter(journey => selectedRouteJourneyIds.includes(journey.id));
  }, [filteredJourneys, selectedRouteJourneyIds]);

  const calculateFilteredPrices = (journey: GroupedJourney) => {
    if (journey.offers.length === 0) {
      return { minPrice: 0, avgPrice: 0, maxPrice: 0 };
    }

    const allPrices = [
      ...journey.offers.map((o) => o.minPrice),
      ...journey.offers.map((o) => o.avgPrice),
      ...journey.offers.map((o) => o.maxPrice),
    ];

    const minPrice = Math.min(...allPrices);
    const maxPrice = Math.max(...allPrices);
    const avgPrice =
      allPrices.reduce((sum, price) => sum + price, 0) / allPrices.length;

    return {
      minPrice,
      maxPrice,
      avgPrice: Math.round(avgPrice),
    };
  };

  return (
    <div className="space-y-6">
      {/* Filtres globaux */}
      <GlobalFilters
        filters={filters}
        availableOptions={availableOptions}
        onCarrierFilter={handleCarrierFilter}
        onClassFilter={handleClassFilter}
        onDiscountCardFilter={handleDiscountCardFilter}
        onClearFilters={clearFilters}
      />

      {/* Indicateur de sélection de route */}
      {selectedRouteJourneyIds.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div className="text-sm text-blue-800">
              <span className="font-medium">Route sélectionnée :</span> {displayJourneys.length} trajet(s) affiché(s)
            </div>
            <button
              onClick={() => setSelectedRouteJourneyIds([])}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              Voir tous les trajets
            </button>
          </div>
        </div>
      )}

      {/* Carte */}
      <div className="h-96">
        <TrainMap 
          journeys={filteredJourneys} 
          onRouteSelect={setSelectedRouteJourneyIds}
        />
      </div>

      {/* Cartes des trajets */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {displayJourneys.map((journey) => {
          const filteredPrices = calculateFilteredPrices(journey);

          return (
            <JourneyCard
              key={journey.id}
              journey={journey}
              filteredPrices={filteredPrices}
            />
          );
        })}
      </div>
    </div>
  );
};

export default JourneysTab; 