import { useCallback, useEffect, useRef, useState } from "react";
import datesData from "../data/dates.json";
import { GroupedJourney } from "../types/journey";
import { saveFilters } from "../utils/filterStorage";

export type Journey = GroupedJourney;

const FILTER_DEBOUNCE_DELAY = 300;

export const useJourneyData = () => {
  const [journeys, setJourneys] = useState<Journey[]>([]);
  const [allJourneys, setAllJourneys] = useState<Journey[]>([]); // Nouvelles données non filtrées
  const [loading, setLoading] = useState(false);
  const [filterLoading, setFilterLoading] = useState(false); // Nouvelle barre de chargement pour les filtres
  const [error, setError] = useState<string | null>(null);
  const [analysisDates, setAnalysisDates] = useState<string[]>([]);
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const [datesLoaded, setDatesLoaded] = useState(false);
  const [currentFilters, setCurrentFilters] = useState<{
    carriers: string[];
    classes: string[];
    discountCards: string[];
    flexibilities: string[];
    selectedDates: string[];
  }>({
    carriers: [],
    classes: [],
    discountCards: ["NONE"],
    flexibilities: [],
    selectedDates: [],
  });

  // Ref pour le debounce
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const fetchJourneys = useCallback(
    async (filters?: {
      carriers?: string[];
      classes?: string[];
      discountCards?: string[];
      flexibilities?: string[];
      selectedDates?: string[];
    }) => {
      try {
        // Vérifier si on a déjà chargé des données dans cette session
        const hasLoadedBefore = sessionStorage.getItem("journeys-loaded") === "true";
        
        // Utiliser la barre de chargement discrète pour tous les chargements sauf le premier réel
        if (journeys.length > 0 || allJourneys.length > 0 || hasLoadedBefore) {
          setFilterLoading(true);
        } else {
          setLoading(true);
          sessionStorage.setItem("journeys-loaded", "true");
        }

        const requestBody = {
          carriers: filters?.carriers || [],
          classes: filters?.classes || [],
          discountCards: filters?.discountCards || ["NONE"],
          flexibilities: filters?.flexibilities || [],
          selectedDates: filters?.selectedDates || [],
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
            flexibilities: string[];
          }) => {
            const journeyId = `${item.departureStation}-${item.arrivalStation}`;

            // Créer des offres factices pour maintenir la compatibilité avec l'interface Journey
            const dummyOffers = item.carriers.flatMap((carrier) =>
              item.classes.flatMap((travelClass) =>
                item.discountCards.flatMap((discountCard) =>
                  (item.flexibilities || []).map((flexibility) => ({
                    departureStation: item.departureStation,
                    departureStationId: item.departureStationId,
                    arrivalStation: item.arrivalStation,
                    arrivalStationId: item.arrivalStationId,
                    minPrice: item.minPrice,
                    avgPrice: item.avgPrice,
                    maxPrice: item.maxPrice,
                    carriers: [carrier],
                    classes: [travelClass],
                    discountCards: [discountCard],
                    flexibilities: [flexibility],
                  }))
                )
              )
            );

            journeyMap.set(journeyId, {
              id: journeyId,
              name: `${item.departureStation} ⟷ ${item.arrivalStation}`,
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
          allJourneys.length === 0 && processedJourneys.length > 0;

        if (isFirstLoad) {
          setAllJourneys(processedJourneys);
        }

        const newFilters = {
          carriers: filters?.carriers || [],
          classes: filters?.classes || [],
          discountCards: filters?.discountCards || ["NONE"],
          flexibilities: filters?.flexibilities || [],
          selectedDates: filters?.selectedDates || [],
        };
        setCurrentFilters(newFilters);
        saveFilters(newFilters);
        setError(null);
      } catch (err) {
        console.error("Erreur lors de la récupération des données:", err);
        setError(err instanceof Error ? err.message : "Erreur inconnue");
      } finally {
        setLoading(false);
        setTimeout(() => {
          setFilterLoading(false);
        }, FILTER_DEBOUNCE_DELAY);
      }
    },
    [journeys.length, allJourneys.length]
  );

  // Dates d'analyse fixes
  useEffect(() => {
    if (!datesLoaded) {
      setAnalysisDates(datesData);
      setDatesLoaded(true);
    }
  }, [datesLoaded]);

  const handleDateSelect = (dates: string[]) => {
    setSelectedDates(dates);
    // Utiliser applyFilters pour la cohérence avec le debounce
    applyFilters({ selectedDates: dates });
  };

  // Fonction pour appliquer les filtres avec debounce et cumulation
  const applyFilters = useCallback(
    (newFilters: {
      carriers?: string[];
      classes?: string[];
      discountCards?: string[];
      flexibilities?: string[];
      selectedDates?: string[];
    }) => {
      // Annuler le timeout précédent
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }

      // Créer les nouveaux filtres en cumulant avec les filtres actuels
      const updatedFilters = {
        ...currentFilters,
        carriers: newFilters.carriers ?? currentFilters.carriers,
        classes: newFilters.classes ?? currentFilters.classes,
        discountCards: newFilters.discountCards ?? currentFilters.discountCards,
        flexibilities: newFilters.flexibilities ?? currentFilters.flexibilities,
        selectedDates: newFilters.selectedDates ?? currentFilters.selectedDates,
      };

      // Activer le chargement immédiatement pour désactiver les filtres
      setFilterLoading(true);

      // Débouncer l'appel à l'API
      debounceTimeoutRef.current = setTimeout(() => {
        fetchJourneys(updatedFilters);
      }, FILTER_DEBOUNCE_DELAY);
    },
    [currentFilters, fetchJourneys]
  );

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
    selectedDates,
    handleDateSelect,
    fetchJourneys,
    applyFilters,
    currentFilters,
  };
};
