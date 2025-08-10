import { useCallback, useEffect, useRef, useState } from "react";

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
    departureDate: string;
  }>;
}

export const useJourneyData = () => {
  const [journeys, setJourneys] = useState<Journey[]>([]);
  const [allJourneys, setAllJourneys] = useState<Journey[]>([]); // Nouvelles données non filtrées
  const [loading, setLoading] = useState(false);
  const [filterLoading, setFilterLoading] = useState(false); // Nouvelle barre de chargement pour les filtres
  const [error, setError] = useState<string | null>(null);
  const [analysisDates, setAnalysisDates] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [datesLoaded, setDatesLoaded] = useState(false);
  const [currentFilters, setCurrentFilters] = useState<{
    excludedCarriers: string[];
    excludedClasses: string[];
    excludedDiscountCards: string[];
    selectedDate: string | null;
  }>({
    excludedCarriers: [],
    excludedClasses: [],
    excludedDiscountCards: ["MAX"],
    selectedDate: null,
  });

  // Ref pour le debounce
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const fetchJourneys = useCallback(
    async (filters?: {
      excludedCarriers?: string[];
      excludedClasses?: string[];
      excludedDiscountCards?: string[];
      selectedDate?: string | null;
    }) => {
      try {
        // Utiliser la barre de chargement discrète pour tous les chargements sauf le premier
        if (journeys.length > 0 || allJourneys.length > 0) {
          setFilterLoading(true);
        } else {
          setLoading(true);
        }

        const requestBody = {
          excludedCarriers: filters?.excludedCarriers || [],
          excludedClasses: filters?.excludedClasses || [],
          excludedDiscountCards: filters?.excludedDiscountCards || [],
          selectedDate: filters?.selectedDate || null,
        };

        const response = await fetch("/api/trains/pricing", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        // Traitement des données agrégées du backend
        const journeyMap = new Map<string, Journey>();

        data.forEach(
          (item: {
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
          }) => {
            const journeyId = `${item.departureStation}-${item.arrivalStation}`;

            // Créer des offres factices pour maintenir la compatibilité avec l'interface Journey
            const dummyOffers = item.carriers.flatMap((carrier) =>
              item.classes.flatMap((travelClass) =>
                item.discountCards.map((discountCard) => ({
                  departureStation: item.departureStation,
                  departureStationId: item.departureStationId,
                  arrivalStation: item.arrivalStation,
                  arrivalStationId: item.arrivalStationId,
                  trainName: `${carrier} ${travelClass}`,
                  carrier,
                  travelClass,
                  discountCard,
                  minPrice: item.minPrice,
                  avgPrice: item.avgPrice,
                  maxPrice: item.maxPrice,
                  departureDate: new Date().toISOString().split("T")[0], // Date par défaut
                }))
              )
            );

            journeyMap.set(journeyId, {
              id: journeyId,
              name: `${item.departureStation} → ${item.arrivalStation}`,
              departureStation: item.departureStation,
              arrivalStation: item.arrivalStation,
              departureStationId: item.departureStationId,
              arrivalStationId: item.arrivalStationId,
              minPrice: item.minPrice,
              avgPrice: Math.round(item.avgPrice),
              maxPrice: item.maxPrice,
              carriers: item.carriers,
              classes: item.classes,
              discountCards: item.discountCards,
              offers: dummyOffers,
            });
          }
        );

        const processedJourneys = Array.from(journeyMap.values());
        setJourneys(processedJourneys);

        // Stocker toutes les données non filtrées UNIQUEMENT lors du premier chargement
        // Vérifier si c'est le premier appel sans filtres (seulement MAX par défaut)
        const isFirstLoad =
          allJourneys.length === 0 &&
          processedJourneys.length > 0 &&
          (!filters ||
            (filters.excludedCarriers?.length === 0 &&
              filters.excludedClasses?.length === 0 &&
              filters.excludedDiscountCards?.length === 1 &&
              filters.excludedDiscountCards[0] === "MAX"));

        if (isFirstLoad) {
          setAllJourneys(processedJourneys);
        }

        setCurrentFilters({
          excludedCarriers: filters?.excludedCarriers || [],
          excludedClasses: filters?.excludedClasses || [],
          excludedDiscountCards: filters?.excludedDiscountCards || ["MAX"],
          selectedDate: filters?.selectedDate || null,
        });
        setError(null);
      } catch (err) {
        console.error("Erreur lors de la récupération des données:", err);
        setError(err instanceof Error ? err.message : "Erreur inconnue");
      } finally {
        setLoading(false);
        setFilterLoading(false);
      }
    },
    []
  );

  // Dates d'analyse fixes
  useEffect(() => {
    if (!datesLoaded) {
      const fixedDates = [
        "2025-12-07",
        "2025-11-30",
        "2025-11-28",
        "2025-09-07",
        "2025-09-06",
        "2025-07-14",
        "2025-07-11",
        "2025-06-08",
        "2025-06-06",
        "2025-04-30",
        "2025-02-07",
        "2025-01-31",
        "2024-12-31",
        "2024-12-30",
        "2024-12-20",
        "2024-12-19",
        "2024-11-24",
        "2024-11-22",
      ];
      setAnalysisDates(fixedDates);
      setDatesLoaded(true);
    }
  }, [datesLoaded]);

  const handleDateSelect = (date: string | null) => {
    setSelectedDate(date);
    // Recharger les données avec la nouvelle date
    fetchJourneys({
      ...currentFilters,
      selectedDate: date,
    });
  };

  // Fonction pour appliquer les filtres avec debounce et cumulation
  const applyFilters = useCallback(
    (newFilters: {
      excludedCarriers?: string[];
      excludedClasses?: string[];
      excludedDiscountCards?: string[];
    }) => {
      // Annuler le timeout précédent
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }

      // Créer les nouveaux filtres en cumulant avec les filtres actuels
      const updatedFilters = {
        ...currentFilters,
        excludedCarriers:
          newFilters.excludedCarriers || currentFilters.excludedCarriers,
        excludedClasses:
          newFilters.excludedClasses || currentFilters.excludedClasses,
        excludedDiscountCards:
          newFilters.excludedDiscountCards ||
          currentFilters.excludedDiscountCards,
      };

      // Débouncer l'appel à l'API
      debounceTimeoutRef.current = setTimeout(() => {
        fetchJourneys(updatedFilters);
      }, 400); // 0.4 secondes de debounce
    },
    [currentFilters, fetchJourneys]
  );

  // Forcer le rechargement quand les filtres changent
  useEffect(() => {}, [currentFilters]);

  // Nettoyer le timeout au démontage
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  return {
    journeys,
    allJourneys, // Exposer les données non filtrées
    loading,
    filterLoading, // Exposer la barre de chargement discrète
    error,
    analysisDates,
    selectedDate,
    handleDateSelect,
    fetchJourneys,
    applyFilters,
    currentFilters,
  };
};
