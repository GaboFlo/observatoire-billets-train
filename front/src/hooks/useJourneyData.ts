import { useCallback, useEffect, useState } from "react";

export interface Journey {
  id: string;
  name: string;
  departureStation: string;
  arrivalStation: string;
  departureStationId: number;
  arrivalStationId: number;
  minPrice: number;
  avgPrice: number;
  maxPrice: number;
  carriers: string[];
  classes: string[];
  discountCards: string[];
  offers: Array<{
    departureStation: string;
    departureStationId: number;
    arrivalStation: string;
    arrivalStationId: number;
    trainName: string;
    carrier: string;
    travelClass: string;
    discountCard: string;
    minPrice: number;
    avgPrice: number;
    maxPrice: number;
    departureDate: string; // Added departureDate to the offer interface
  }>;
}

// Flag global pour éviter les appels multiples
let datesLoaded = false;

export const useJourneyData = () => {
  const [journeys, setJourneys] = useState<Journey[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [analysisDates, setAnalysisDates] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const fetchJourneys = useCallback(
    async (filters?: {
      excludedCarriers?: string[];
      excludedClasses?: string[];
      excludedDiscountCards?: string[];
      selectedDate?: string | null;
    }) => {
      try {
        setLoading(true);
        console.log("Appel à l'API pricing");

        const url = new URL("/api/trains/pricing", window.location.origin);

        // Ajouter les paramètres de filtrage
        if (filters?.excludedCarriers && filters.excludedCarriers.length > 0) {
          url.searchParams.append(
            "excludedCarriers",
            filters.excludedCarriers.join(",")
          );
        }
        if (filters?.excludedClasses && filters.excludedClasses.length > 0) {
          url.searchParams.append(
            "excludedClasses",
            filters.excludedClasses.join(",")
          );
        }
        if (
          filters?.excludedDiscountCards &&
          filters.excludedDiscountCards.length > 0
        ) {
          url.searchParams.append(
            "excludedDiscountCards",
            filters.excludedDiscountCards.join(",")
          );
        }
        if (filters?.selectedDate) {
          url.searchParams.append("date", filters.selectedDate);
        }

        const response = await fetch(url.toString());
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log("Données reçues: ", data);

        // Traitement des données
        const journeyMap = new Map<string, Journey>();

        data.forEach(
          (item: {
            departureStation: string;
            arrivalStation: string;
            departureStationId: number;
            arrivalStationId: number;
            trainName: string;
            carrier: string;
            travelClass: string;
            discountCard: string;
            minPrice: number;
            avgPrice: number;
            maxPrice: number;
            departureDate: string;
          }) => {
            const journeyId = `${item.departureStation}-${item.arrivalStation}`;
            const offer = {
              departureStation: item.departureStation,
              departureStationId: item.departureStationId,
              arrivalStation: item.arrivalStation,
              arrivalStationId: item.arrivalStationId,
              trainName: item.trainName,
              carrier: item.carrier,
              travelClass: item.travelClass,
              discountCard: item.discountCard,
              minPrice: item.minPrice,
              avgPrice: item.avgPrice,
              maxPrice: item.maxPrice,
              departureDate: item.departureDate,
            };

            if (journeyMap.has(journeyId)) {
              const existingJourney = journeyMap.get(journeyId)!;
              existingJourney.offers.push(offer);
              existingJourney.minPrice = Math.min(
                existingJourney.minPrice,
                item.minPrice
              );
              existingJourney.maxPrice = Math.max(
                existingJourney.maxPrice,
                item.maxPrice
              );
              existingJourney.avgPrice = Math.round(
                existingJourney.offers.reduce(
                  (sum, offer) => sum + offer.avgPrice,
                  0
                ) / existingJourney.offers.length
              );
              if (!existingJourney.carriers.includes(item.carrier)) {
                existingJourney.carriers.push(item.carrier);
              }
              if (!existingJourney.classes.includes(item.travelClass)) {
                existingJourney.classes.push(item.travelClass);
              }
              if (!existingJourney.discountCards.includes(item.discountCard)) {
                existingJourney.discountCards.push(item.discountCard);
              }
            } else {
              journeyMap.set(journeyId, {
                id: journeyId,
                name: `${item.departureStation} → ${item.arrivalStation}`,
                departureStation: item.departureStation,
                arrivalStation: item.arrivalStation,
                departureStationId: item.departureStationId,
                arrivalStationId: item.arrivalStationId,
                minPrice: item.minPrice,
                avgPrice: item.avgPrice,
                maxPrice: item.maxPrice,
                carriers: [item.carrier],
                classes: [item.travelClass],
                discountCards: [item.discountCard],
                offers: [offer],
              });
            }
          }
        );

        const processedJourneys = Array.from(journeyMap.values());
        setJourneys(processedJourneys);
        setError(null);
      } catch (err) {
        console.error("Erreur lors de la récupération des données:", err);
        setError(err instanceof Error ? err.message : "Erreur inconnue");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Récupérer les dates d'analyse depuis l'API backend (une seule fois)
  useEffect(() => {
    if (!datesLoaded) {
      const fetchAnalysisDates = async () => {
        try {
          const response = await fetch("/api/trains/dates");
          if (response.ok) {
            const dates = await response.json();
            setAnalysisDates(dates);
          } else {
            console.warn(
              "Impossible de récupérer les dates d'analyse depuis l'API"
            );
            // Fallback avec des dates par défaut si l'API n'est pas disponible
            const today = new Date();
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);
            const twoDaysAgo = new Date(today);
            twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

            setAnalysisDates([
              today.toISOString().split("T")[0],
              yesterday.toISOString().split("T")[0],
              twoDaysAgo.toISOString().split("T")[0],
            ]);
          }
        } catch (err) {
          console.warn(
            "Erreur lors de la récupération des dates d'analyse:",
            err
          );
          // Fallback avec des dates par défaut
          const today = new Date();
          const yesterday = new Date(today);
          yesterday.setDate(yesterday.getDate() - 1);
          const twoDaysAgo = new Date(today);
          twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

          setAnalysisDates([
            today.toISOString().split("T")[0],
            yesterday.toISOString().split("T")[0],
            twoDaysAgo.toISOString().split("T")[0],
          ]);
        }
      };

      fetchAnalysisDates();
      datesLoaded = true;
    }
  }, []); // Dépendances vides pour éviter les re-renders

  const handleDateSelect = (date: string | null) => {
    setSelectedDate(date);
  };

  return {
    journeys,
    loading,
    error,
    analysisDates,
    selectedDate,
    handleDateSelect,
    fetchJourneys,
  };
};
