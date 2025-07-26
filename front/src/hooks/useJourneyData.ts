import { useEffect, useState } from "react";
import { AggregatedPricingResult, GroupedJourney, JourneyFilters } from "@/types/journey";
import { logMissingTranslations } from "@/utils/generateMissingTranslations";

export const useJourneyData = () => {
  const [activeTab, setActiveTab] = useState("journeys");
  const [journeys, setJourneys] = useState<GroupedJourney[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [journeyFilters, setJourneyFilters] = useState<JourneyFilters>({});

  const handleClassFilter = (journeyId: string, travelClass: string) => {
    setJourneyFilters((prev) => {
      const currentFilters = prev[journeyId] || {};
      const newSelectedClass =
        currentFilters.selectedClass === travelClass ? undefined : travelClass;

      return {
        ...prev,
        [journeyId]: {
          ...currentFilters,
          selectedClass: newSelectedClass,
        },
      };
    });
  };

  const handleCarrierFilter = (journeyId: string, carrier: string) => {
    setJourneyFilters((prev) => {
      const currentFilters = prev[journeyId] || {};
      const newSelectedCarrier =
        currentFilters.selectedCarrier === carrier ? undefined : carrier;

      return {
        ...prev,
        [journeyId]: {
          ...currentFilters,
          selectedCarrier: newSelectedCarrier,
        },
      };
    });
  };

  const handleDiscountCardFilter = (journeyId: string, discountCard: string) => {
    setJourneyFilters((prev) => {
      const currentFilters = prev[journeyId] || {};
      const newSelectedCard =
        currentFilters.selectedDiscountCard === discountCard
          ? undefined
          : discountCard;

      return {
        ...prev,
        [journeyId]: {
          ...currentFilters,
          selectedDiscountCard: newSelectedCard,
        },
      };
    });
  };

  useEffect(() => {
    const fetchPricingData = async () => {
      try {
        setLoading(true);
        const response = await fetch("http://localhost:3000/api/trains/pricing");
        if (!response.ok) {
          throw new Error("Erreur lors du chargement des données");
        }
        const data: AggregatedPricingResult[] = await response.json();

        // Grouper les données par trajet (departure + arrival)
        const journeyMap = new Map<string, AggregatedPricingResult[]>();

        data.forEach((item) => {
          const key = `${item.departureStationId}-${item.arrivalStationId}`;
          if (!journeyMap.has(key)) {
            journeyMap.set(key, []);
          }
          journeyMap.get(key)!.push(item);
        });

        // Créer les objets GroupedJourney
        const groupedJourneys: GroupedJourney[] = Array.from(
          journeyMap.entries()
        ).map(([key, offers]) => {
          const departure = offers[0].departureStation;
          const departureId = offers[0].departureStationId;
          const arrival = offers[0].arrivalStation;
          const arrivalId = offers[0].arrivalStationId;
          const carriers = [...new Set(offers.map((o) => o.carrier))];
          const classes = [...new Set(offers.map((o) => o.travelClass))];
          const discountCards = [...new Set(offers.map((o) => o.discountCard))];

          const allPrices = [
            ...offers.map((o) => o.minPrice),
            ...offers.map((o) => o.avgPrice),
            ...offers.map((o) => o.maxPrice),
          ];

          const minPrice = Math.min(...allPrices);
          const maxPrice = Math.max(...allPrices);
          const avgPrice =
            allPrices.reduce((sum, price) => sum + price, 0) / allPrices.length;

          return {
            id: key,
            name: `${departure} → ${arrival}`,
            departureStation: departure,
            departureStationId: departureId,
            arrivalStation: arrival,
            arrivalStationId: arrivalId,
            carriers,
            classes,
            discountCards,
            offers,
            minPrice,
            maxPrice,
            avgPrice: Math.round(avgPrice),
          };
        });

        setJourneys(groupedJourneys);
        
        // Analyser les traductions manquantes en mode développement
        if (process.env.NODE_ENV === 'development') {
          logMissingTranslations(groupedJourneys);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Une erreur est survenue");
      } finally {
        setLoading(false);
      }
    };

    fetchPricingData();
  }, []);

  return {
    activeTab,
    setActiveTab,
    journeys,
    loading,
    error,
    journeyFilters,
    handleClassFilter,
    handleCarrierFilter,
    handleDiscountCardFilter,
  };
};

export const useJourneyDetails = (journeyId: string) => {
  const [journey, setJourney] = useState<GroupedJourney | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchJourneyDetails = async () => {
      try {
        setLoading(true);
        const response = await fetch("http://localhost:3000/api/trains/pricing");
        if (!response.ok) {
          throw new Error("Erreur lors du chargement des données");
        }
        const data: AggregatedPricingResult[] = await response.json();

        // Trouver le trajet spécifique par son ID
        const journeyMap = new Map<string, AggregatedPricingResult[]>();

        data.forEach((item) => {
          const key = `${item.departureStationId}-${item.arrivalStationId}`;
          if (!journeyMap.has(key)) {
            journeyMap.set(key, []);
          }
          journeyMap.get(key)!.push(item);
        });

        const journeyData = journeyMap.get(journeyId);
        
        if (!journeyData) {
          setError("Trajet non trouvé");
          return;
        }

        const departure = journeyData[0].departureStation;
        const departureId = journeyData[0].departureStationId;
        const arrival = journeyData[0].arrivalStation;
        const arrivalId = journeyData[0].arrivalStationId;
        const carriers = [...new Set(journeyData.map((o) => o.carrier))];
        const classes = [...new Set(journeyData.map((o) => o.travelClass))];
        const discountCards = [...new Set(journeyData.map((o) => o.discountCard))];

        const allPrices = [
          ...journeyData.map((o) => o.minPrice),
          ...journeyData.map((o) => o.avgPrice),
          ...journeyData.map((o) => o.maxPrice),
        ];

        const minPrice = Math.min(...allPrices);
        const maxPrice = Math.max(...allPrices);
        const avgPrice =
          allPrices.reduce((sum, price) => sum + price, 0) / allPrices.length;

        const groupedJourney: GroupedJourney = {
          id: journeyId,
          name: `${departure} → ${arrival}`,
          departureStation: departure,
          departureStationId: departureId,
          arrivalStation: arrival,
          arrivalStationId: arrivalId,
          carriers,
          classes,
          discountCards,
          offers: journeyData,
          minPrice,
          maxPrice,
          avgPrice: Math.round(avgPrice),
        };

        setJourney(groupedJourney);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Une erreur est survenue");
      } finally {
        setLoading(false);
      }
    };

    if (journeyId) {
      fetchJourneyDetails();
    }
  }, [journeyId]);

  return { journey, loading, error };
}; 