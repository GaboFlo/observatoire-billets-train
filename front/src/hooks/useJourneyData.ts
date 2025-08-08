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
        // Utiliser la barre de chargement discrète pour les filtres
        if (journeys.length > 0) {
          setFilterLoading(true);
        } else {
          setLoading(true);
        }
        console.log("Appel à l'API pricing avec filtres:", filters);

        const requestBody = {
          excludedCarriers: filters?.excludedCarriers || [],
          excludedClasses: filters?.excludedClasses || [],
          excludedDiscountCards: filters?.excludedDiscountCards || [],
          selectedDate: filters?.selectedDate || null,
        };

        console.log("Body de la requête:", requestBody);

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
        console.log("Données reçues: ", data);

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
        console.log(
          "Journeys traités:",
          processedJourneys.length,
          processedJourneys
        );
        setJourneys(processedJourneys);

        // Stocker toutes les données non filtrées lors du premier chargement
        if (allJourneys.length === 0) {
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
      setDatesLoaded(true);
    }
  }, [datesLoaded]); // Dépendances vides pour éviter les re-renders

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
      console.log("applyFilters appelé avec:", newFilters);

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
  useEffect(() => {
    console.log("currentFilters changé:", currentFilters);
  }, [currentFilters]);

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
