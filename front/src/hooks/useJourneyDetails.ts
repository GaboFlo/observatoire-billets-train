import { DetailedPricingResult, GroupedJourney } from "@/types/journey";
import { useCallback, useEffect, useRef, useState } from "react";

interface JourneyDetailsFilters {
  excludedCarriers: string[];
  excludedClasses: string[];
  excludedDiscountCards: string[];
  selectedDates?: string[];
  departureStationId?: number;
  arrivalStationId?: number;
  trainNumber?: number;
}

export const useJourneyDetails = (
  departureStation: string,
  arrivalStation: string,
  selectedDates?: string[],
  departureStationId?: number,
  arrivalStationId?: number
) => {
  const [journey, setJourney] = useState<GroupedJourney | null>(null);
  const [detailedOffers, setDetailedOffers] = useState<DetailedPricingResult[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [filterLoading, setFilterLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysisDates, setAnalysisDates] = useState<string[]>([]);
  const [currentFilters, setCurrentFilters] = useState<JourneyDetailsFilters>({
    excludedCarriers: [],
    excludedClasses: [],
    excludedDiscountCards: [],
    selectedDates: [],
  });

  // Ref pour le debounce
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const fetchJourneyDetails = useCallback(
    async (filters?: JourneyDetailsFilters) => {
      try {
        setFilterLoading(true);

        // Corps de la requête POST avec les filtres (cohérent avec la page d'accueil)
        const requestBody = {
          excludedCarriers: filters?.excludedCarriers || [],
          excludedClasses: filters?.excludedClasses || [],
          excludedDiscountCards: filters?.excludedDiscountCards || [],
          selectedDates: filters?.selectedDates || [],
          departureStationId: filters?.departureStationId || departureStationId,
          arrivalStationId: filters?.arrivalStationId || arrivalStationId,
          trainNumber: filters?.trainNumber,
        };

        const response = await fetch("/api/trains/journey-details", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
          throw new Error("Erreur lors du chargement des données");
        }
        const data: DetailedPricingResult[] = await response.json();

        if (data.length === 0) {
          setError("Trajet non trouvé");
          return;
        }

        // Créer un objet GroupedJourney à partir des données détaillées
        const firstOffer = data[0];
        const carriers = [...new Set(data.map((offer) => offer.carrier))];
        const classes = [...new Set(data.map((offer) => offer.travelClass))];
        const discountCards = [
          ...new Set(data.map((offer) => offer.discountCard)),
        ];

        const allPrices = data.map((offer) => offer.minPrice);
        const minPrice = Math.min(...allPrices);
        const maxPrice = Math.max(...allPrices);
        const avgPrice = Math.round(
          allPrices.reduce((sum, price) => sum + price, 0) / allPrices.length
        );

        const journeyData: GroupedJourney = {
          id: `${firstOffer.departureStationId}-${firstOffer.arrivalStationId}`,
          name: `${firstOffer.departureStation} → ${firstOffer.arrivalStation}`,
          departureStation: firstOffer.departureStation,
          departureStationId: firstOffer.departureStationId,
          arrivalStation: firstOffer.arrivalStation,
          arrivalStationId: firstOffer.arrivalStationId,
          carriers,
          classes,
          discountCards,
          offers: data.map((offer) => ({
            departureStation: offer.departureStation,
            departureStationId: offer.departureStationId,
            arrivalStation: offer.arrivalStation,
            arrivalStationId: offer.arrivalStationId,
            minPrice: offer.minPrice,
            avgPrice: offer.avgPrice,
            maxPrice: offer.maxPrice,
            carriers: [offer.carrier],
            classes: [offer.travelClass],
            discountCards: [offer.discountCard],
          })),
          minPrice,
          maxPrice,
          avgPrice,
        };

        setJourney(journeyData);
        setDetailedOffers(data);

        // Mettre à jour les filtres actuels
        setCurrentFilters({
          excludedCarriers: filters?.excludedCarriers || [],
          excludedClasses: filters?.excludedClasses || [],
          excludedDiscountCards: filters?.excludedDiscountCards || [],
          selectedDates: filters?.selectedDates || [],
          departureStationId: filters?.departureStationId,
          arrivalStationId: filters?.arrivalStationId,
          trainNumber: filters?.trainNumber,
        });

        // Extraire les dates uniques des offres pour les filtres
        const uniqueDates = [
          ...new Set(data.map((offer) => offer.departureDate)),
        ].sort();
        setAnalysisDates(uniqueDates);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Une erreur est survenue"
        );
      } finally {
        setLoading(false);
        setFilterLoading(false);
      }
    },
    [departureStation, arrivalStation, departureStationId, arrivalStationId]
  );

  // Fonction pour appliquer les filtres avec debounce

  const applyFilters = useCallback(
    (newFilters: Partial<JourneyDetailsFilters>) => {
      // Annuler le timeout précédent
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }

      // Créer les nouveaux filtres en cumulant avec les filtres actuels
      const updatedFilters = {
        ...currentFilters,
        ...newFilters,
      };

      setCurrentFilters(updatedFilters);

      // Débouncer l'appel à l'API
      debounceTimeoutRef.current = setTimeout(() => {
        fetchJourneyDetails(updatedFilters);
      }, 400); // 0.4 secondes de debounce
    },
    [currentFilters, fetchJourneyDetails]
  );

  // Chargement initial - créer un objet journey basique et définir les dates fixes par défaut
  useEffect(() => {
    if (departureStation && arrivalStation) {
      // Créer un objet journey basique pour l'affichage
      const basicJourney: GroupedJourney = {
        id: `${departureStation}-${arrivalStation}`,
        name: `${departureStation} ⟷ ${arrivalStation}`,
        departureStation,
        departureStationId: 0, // Valeur par défaut
        arrivalStation,
        arrivalStationId: 0, // Valeur par défaut
        carriers: [],
        classes: [],
        discountCards: [],
        offers: [],
        minPrice: 0,
        maxPrice: 0,
        avgPrice: 0,
      };

      setJourney(basicJourney);
      setDetailedOffers([]);
      setError(null);
      setLoading(false);

      // Définir les dates fixes par défaut (même que dans useJourneyData)
      const fixedDates = [
        "2024-11-22",
        "2024-11-24",
        "2024-12-19",
        "2024-12-20",
        "2024-12-30",
        "2024-12-31",
        "2025-01-31",
        "2025-02-07",
        "2025-04-30",
        "2025-06-06",
        "2025-06-08",
        "2025-07-11",
        "2025-07-14",
        "2025-08-15",
        "2025-09-01",
        "2025-09-02",
        "2025-10-31",
        "2025-11-01",
        "2025-12-24",
        "2025-12-25",
        "2025-12-26",
        "2025-12-31",
        "2026-01-01",
        "2026-01-02",
        "2026-01-19",
        "2026-02-16",
        "2026-03-31",
        "2026-04-01",
        "2026-05-01",
        "2026-05-08",
        "2026-05-09",
        "2026-05-20",
        "2026-07-14",
        "2026-08-15",
        "2026-11-01",
        "2026-11-11",
        "2026-12-25",
        "2026-12-26",
      ];
      setAnalysisDates(fixedDates);
    }
  }, [departureStation, arrivalStation]);

  // Nettoyer le timeout au démontage
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  return {
    journey,
    detailedOffers,
    loading,
    filterLoading,
    error,
    analysisDates,
    applyFilters,
    currentFilters,
  };
};
