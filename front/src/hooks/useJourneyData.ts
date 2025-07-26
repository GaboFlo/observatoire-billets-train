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
          const key = `${item.departureStation}-${item.arrivalStation}`;
          if (!journeyMap.has(key)) {
            journeyMap.set(key, []);
          }
          journeyMap.get(key)!.push(item);
        });

        // Créer les objets GroupedJourney
        const groupedJourneys: GroupedJourney[] = Array.from(
          journeyMap.entries()
        ).map(([key, offers]) => {
          const [departure, arrival] = key.split("-");
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
            name: `${departure} - ${arrival}`,
            departureStation: departure,
            arrivalStation: arrival,
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