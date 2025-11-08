import {
  ChartDataResult,
  ChartStatsResult,
  DetailedPricingResult,
  GroupedJourney,
} from "@/types/journey";
import { useCallback, useEffect, useRef, useState } from "react";

interface JourneyDetailsFilters {
  carriers: string[];
  classes: string[];
  discountCards: string[];
  flexibilities?: string[];
  selectedDates?: string[];
  departureStationId?: number;
  arrivalStationId?: number;
  trainNumber?: number;
}

interface TrainInfo {
  trainNumber: string;
  departureTime: string;
  arrivalTime: string;
  carrier: string;
  minPrice: number;
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
  const [calculatedStats, setCalculatedStats] = useState<{
    minPrice: number;
    maxPrice: number;
    avgPrice: number;
  }>({ minPrice: 0, maxPrice: 0, avgPrice: 0 });
  const [loading, setLoading] = useState(true);
  const [filterLoading, setFilterLoading] = useState(false);
  const [chartDataLoaded, setChartDataLoaded] = useState(false);
  const [baseDataLoaded, setBaseDataLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // État de chargement global : true tant que toutes les données ne sont pas chargées
  const isGlobalLoading = loading || !baseDataLoaded || !chartDataLoaded;

  // Utiliser filterLoading pour l'indicateur linéaire au lieu du loading global
  const shouldShowLinearLoader = isGlobalLoading || filterLoading;
  const [analysisDates, setAnalysisDates] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [availableTrains, setAvailableTrains] = useState<TrainInfo[]>([]);
  const [selectedTrain, setSelectedTrain] = useState<string | null>(null);
  const [selectedCarriers, setSelectedCarriers] = useState<string[]>([]);
  const [selectedClasses, setSelectedClasses] = useState<string[]>(["economy"]);
  const [selectedDiscountCards, setSelectedDiscountCards] = useState<string[]>(
    []
  );
  const [selectedFlexibilities, setSelectedFlexibilities] = useState<string[]>(
    []
  );
  const [availableCarriers, setAvailableCarriers] = useState<string[]>([
    "sncf",
    "ouigo",
    "trenitalia_france",
    "db",
    "eurostar",
  ]);
  const [availableClasses, setAvailableClasses] = useState<string[]>([
    "economy",
    "first",
  ]);
  const [availableDiscountCards, setAvailableDiscountCards] = useState<
    string[]
  >(["NONE", "AVANTAGE_JEUNE", "MAX"]);
  const [availableFlexibilities, setAvailableFlexibilities] = useState<
    string[]
  >(["nonflexi", "flexi", "semiflexi"]);
  const [currentFilters, setCurrentFilters] = useState<JourneyDetailsFilters>({
    carriers: [],
    classes: ["economy"],
    discountCards: [],
    selectedDates: [],
    departureStationId,
    arrivalStationId,
  });

  // Ref pour le debounce
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Fonction pour récupérer les dates disponibles
  const fetchAvailableDates = useCallback(async () => {
    try {
      setLoading(true);

      const response = await fetch("/api/trains/available-dates", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          departureStationId,
          arrivalStationId,
        }),
      });

      if (!response.ok) {
        throw new Error(
          `Erreur lors du chargement des dates: ${response.status}`
        );
      }

      const dates: string[] = await response.json();
      setAnalysisDates(dates);
      setError(null);
    } catch (err) {
      console.error("❌ Erreur dates:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Erreur lors du chargement des dates"
      );
    } finally {
      setLoading(false);
      setBaseDataLoaded(true);
    }
  }, [departureStationId, arrivalStationId]);

  // Fonction pour récupérer les trains pour une date
  const fetchTrainsForDate = useCallback(
    async (date: string) => {
      try {
        setFilterLoading(true);

        const response = await fetch("/api/trains/trains-for-date", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            departureStationId,
            arrivalStationId,
            date,
          }),
        });

        if (!response.ok) {
          throw new Error(
            `Erreur lors du chargement des trains: ${response.status}`
          );
        }

        const trains: TrainInfo[] = await response.json();
        setAvailableTrains(trains);
        setError(null);
      } catch (err) {
        console.error("❌ Erreur trains:", err);
        setError(
          err instanceof Error
            ? err.message
            : "Erreur lors du chargement des trains"
        );
      } finally {
        setFilterLoading(false);
      }
    },
    [departureStationId, arrivalStationId]
  );

  // Fonction pour appliquer les filtres avec debounce

  // applyFilters ne doit dépendre que de fetchJourneyDetails pour éviter les boucles infinies
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
    },
    [currentFilters]
  );

  // Chargement initial - récupérer les dates disponibles
  useEffect(() => {
    if (departureStation && arrivalStation) {
      // Réinitialiser l'état
      setSelectedDate(null);
      setAvailableTrains([]);
      setSelectedTrain(null);
      setSelectedClasses(["economy"]);
      setDetailedOffers([]);
      setError(null);

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
      setLoading(true);

      // Récupérer les dates disponibles
      fetchAvailableDates();

      // Charger les données initiales avec les IDs de stations
      // Utiliser des filtres explicites pour éviter la boucle infinie avec currentFilters
    }
  }, [departureStation, arrivalStation, fetchAvailableDates]);

  // Fonction pour récupérer les options disponibles (carriers, classes, discountCards)
  const fetchAvailableOptions = useCallback(
    async (date?: string) => {
      try {
        setFilterLoading(true);

        // Si aucune date n'est fournie, utiliser la première date disponible ou une date par défaut
        const targetDate =
          date || analysisDates[0] || new Date().toISOString().split("T")[0];

        const response = await fetch("/api/trains/pricing", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            departureStationId,
            arrivalStationId,
            carriers: [],
            classes: [],
            discountCards: [],
            selectedDates: [targetDate],
          }),
        });

        if (!response.ok) {
          throw new Error(
            `Erreur lors du chargement des options: ${response.status}`
          );
        }

        const responseData = await response.json();
        // L'endpoint /api/trains/pricing retourne un tableau, on prend le premier élément
        const stats = Array.isArray(responseData)
          ? responseData[0]
          : responseData;

        if (stats && typeof stats === "object") {
          setAvailableCarriers(stats.carriers || []);
          setAvailableClasses(stats.classes || []);
        } else {
          setAvailableCarriers([]);
          setAvailableClasses([]);
        }

        // S'assurer que les cartes de réduction par défaut sont toujours incluses
        const defaultDiscountCards = ["NONE", "AVANTAGE_JEUNE", "MAX"];
        const apiDiscountCards = stats?.discountCards || [];
        const allDiscountCards = [
          ...new Set([...defaultDiscountCards, ...apiDiscountCards]),
        ];
        setAvailableDiscountCards(allDiscountCards);
      } catch (err) {
        console.error("❌ Erreur options:", err);
        // En cas d'erreur, garder les valeurs par défaut
      } finally {
        setFilterLoading(false);
      }
    },
    [departureStationId, arrivalStationId, analysisDates]
  );

  // Récupérer les options disponibles après l'initialisation
  useEffect(() => {
    if (departureStation && arrivalStation) {
      fetchAvailableOptions();
    }
  }, [departureStation, arrivalStation, fetchAvailableOptions]);

  // Fonctions de gestion des sélections
  const handleDateSelect = useCallback(
    (date: string | null) => {
      setSelectedDate(date);
      setSelectedTrain(null); // Réinitialiser la sélection de train

      // Ne faire l'appel API que si une date spécifique est sélectionnée
      if (date !== null) {
        fetchTrainsForDate(date);
      }
    },
    [fetchTrainsForDate]
  );

  const handleTrainSelect = useCallback((trainNumber: string) => {
    setSelectedTrain(trainNumber);
  }, []);

  // Nouvelles fonctions de gestion des filtres
  const handleCarrierToggle = useCallback(
    (carrier: string) => {
      const newSelectedCarriers = selectedCarriers.includes(carrier)
        ? selectedCarriers.filter((c) => c !== carrier)
        : [...selectedCarriers, carrier];

      setSelectedCarriers(newSelectedCarriers);

      // Déclencher un appel API avec les nouveaux filtres
      // Maintenant on passe directement les carriers sélectionnés
      applyFilters({
        carriers: newSelectedCarriers,
      });
    },
    [selectedCarriers, applyFilters]
  );

  const handleClassToggle = useCallback(
    (travelClass: string) => {
      const newSelectedClasses = selectedClasses.includes(travelClass)
        ? []
        : [travelClass];

      setSelectedClasses(newSelectedClasses);

      applyFilters({
        classes: newSelectedClasses,
      });
    },
    [selectedClasses, applyFilters]
  );

  const handleDiscountCardToggle = useCallback(
    (discountCard: string) => {
      const newSelectedDiscountCards = selectedDiscountCards.includes(
        discountCard
      )
        ? selectedDiscountCards.filter((c) => c !== discountCard)
        : [...selectedDiscountCards, discountCard];

      setSelectedDiscountCards(newSelectedDiscountCards);

      // Déclencher un appel API avec les nouveaux filtres
      // Maintenant on passe directement les cartes sélectionnées
      applyFilters({
        discountCards: newSelectedDiscountCards,
      });
    },
    [selectedDiscountCards, applyFilters]
  );

  const handleFlexibilityToggle = useCallback(
    (flexibility: string) => {
      const newSelectedFlexibilities = selectedFlexibilities.includes(
        flexibility
      )
        ? selectedFlexibilities.filter((f) => f !== flexibility)
        : [...selectedFlexibilities, flexibility];

      setSelectedFlexibilities(newSelectedFlexibilities);

      // Déclencher un appel API avec les nouveaux filtres
      applyFilters({
        flexibilities: newSelectedFlexibilities,
      });
    },
    [selectedFlexibilities, applyFilters]
  );

  // Fonction pour faire une requête pricing
  const makePricingRequest = useCallback(
    async (requestBody: Record<string, unknown>) => {
      const response = await fetch("/api/trains/pricing", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`Erreur lors de l'analyse : ${response.status}`);
      }

      const responseData = await response.json();
      return Array.isArray(responseData) ? responseData[0] : responseData;
    },
    []
  );

  // Fonction pour déterminer le type d'analyse et construire le body de la requête
  const getAnalysisRequest = useCallback(() => {
    const baseRequest = {
      carriers:
        selectedCarriers.length > 0 ? selectedCarriers : availableCarriers,
      classes: selectedClasses.length > 0 ? selectedClasses : availableClasses,
      discountCards:
        selectedDiscountCards.length > 0
          ? selectedDiscountCards
          : availableDiscountCards,
      flexibilities:
        selectedFlexibilities.length > 0
          ? selectedFlexibilities
          : availableFlexibilities,
      departureStationId,
      arrivalStationId,
    };

    if (!selectedDate && !selectedTrain) {
      return { ...baseRequest, selectedDates: [], trainNumber: selectedTrain };
    }

    if (!selectedDate && selectedTrain) {
      return {
        ...baseRequest,
        trainNumber: selectedTrain,
        selectedDates: [],
      };
    }

    if (selectedDate && selectedTrain === null) {
      return {
        ...baseRequest,
        selectedDates: [selectedDate],
      };
    }

    return {
      ...baseRequest,
      trainNumber: selectedTrain,
      selectedDates: [selectedDate],
    };
  }, [
    selectedDate,
    selectedTrain,
    selectedCarriers,
    selectedClasses,
    selectedDiscountCards,
    selectedFlexibilities,
    departureStationId,
    arrivalStationId,
    availableCarriers,
    availableClasses,
    availableDiscountCards,
    availableFlexibilities,
  ]);

  // Fonction pour traiter le résultat de l'analyse
  const processAnalysisResult = useCallback(
    (analysisResult: unknown) => {
      if (!analysisResult) return;

      // Si c'est un tableau (cas général), trouver l'élément correspondant au trajet
      if (Array.isArray(analysisResult)) {
        const journeyData = analysisResult.find(
          (item: { departureStationId: number; arrivalStationId: number }) =>
            item.departureStationId === departureStationId &&
            item.arrivalStationId === arrivalStationId
        );
        if (journeyData) {
          setJourney((prev) =>
            prev
              ? {
                  ...prev,
                  minPrice: journeyData.minPrice,
                  maxPrice: journeyData.maxPrice,
                  avgPrice: journeyData.avgPrice,
                }
              : null
          );
        }
      } else {
        // Si c'est un objet direct, l'utiliser directement
        setJourney((prev) =>
          prev
            ? {
                ...prev,
                minPrice: (analysisResult as { minPrice: number }).minPrice,
                maxPrice: (analysisResult as { maxPrice: number }).maxPrice,
                avgPrice: (analysisResult as { avgPrice: number }).avgPrice,
              }
            : null
        );
      }
    },
    [departureStationId, arrivalStationId]
  );

  // Fonction pour récupérer les données de statistiques
  const fetchStatisticsData = useCallback(async () => {
    try {
      setFilterLoading(true);
      setChartDataLoaded(false);

      const requestBody = getAnalysisRequest();
      const response = await fetch("/api/trains/chart-data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`Erreur lors de l'analyse : ${response.status}`);
      }

      const result: ChartStatsResult = await response.json();

      // Stocker les statistiques calculées côté backend
      setCalculatedStats(result.stats);

      // Convertir les données de graphique en format DetailedPricingResult pour compatibilité
      const statisticsData = result.chartData.map((item: ChartDataResult) => ({
        departureStation: "",
        departureStationId: 0,
        arrivalStation: "",
        arrivalStationId: 0,
        travelClass: "economy",
        discountCard: item.discountCard || "NONE",
        flexibility: "nonflexi",
        trainName: "",
        carrier: "sncf",
        minPrice: item.price,
        avgPrice: item.price,
        maxPrice: item.price,
        departureDate: "",
        departureTime: "",
        arrivalTime: "",
        is_sellable: item.is_sellable,
        unsellable_reason: null,
        daysBeforeDeparture: item.daysBeforeDeparture,
      }));
      setDetailedOffers(statisticsData);
      setChartDataLoaded(true);
    } catch (err) {
      console.error("❌ Erreur statistiques:", err);
      setError(err instanceof Error ? err.message : "Erreur lors de l'analyse");
    } finally {
      setFilterLoading(false);
    }
  }, [getAnalysisRequest]);

  // Fonction pour déclencher l'analyse avec les filtres actuels
  const triggerAnalysis = useCallback(async () => {
    try {
      setFilterLoading(true);

      const requestBody = getAnalysisRequest();
      const analysisResult = await makePricingRequest(requestBody);
      processAnalysisResult(analysisResult);
    } catch (err) {
      console.error("❌ Erreur analyse:", err);
      setError(err instanceof Error ? err.message : "Erreur lors de l'analyse");
    } finally {
      setFilterLoading(false);
    }
  }, [getAnalysisRequest, makePricingRequest, processAnalysisResult]);

  // Déclencher l'analyse avec debounce quand les filtres changent
  useEffect(() => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    debounceTimeoutRef.current = setTimeout(() => {
      // Déclencher à la fois l'analyse des prix et les statistiques
      triggerAnalysis();
      fetchStatisticsData();
    }, 450);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    selectedDate,
    selectedTrain,
    selectedCarriers,
    selectedClasses,
    selectedDiscountCards,
    selectedFlexibilities,
    departureStationId,
    arrivalStationId,
  ]);

  // Fonction pour récupérer tous les trains distincts pour ce trajet
  const fetchAllTrainsForJourney = useCallback(async () => {
    try {
      setFilterLoading(true);

      // Utiliser la première date disponible ou une date par défaut
      const targetDate =
        analysisDates[0] || new Date().toISOString().split("T")[0];

      const response = await fetch("/api/trains/trains-for-date", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          departureStationId,
          arrivalStationId,
          date: targetDate,
        }),
      });

      if (!response.ok) {
        throw new Error(
          `Erreur lors du chargement des trains: ${response.status}`
        );
      }

      const trains: TrainInfo[] = await response.json();
      setAvailableTrains(trains);
      setError(null);
    } catch (err) {
      console.error("❌ Erreur trains:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Erreur lors du chargement des trains"
      );
    } finally {
      setFilterLoading(false);
    }
  }, [departureStationId, arrivalStationId, analysisDates]);

  // Récupérer les options disponibles quand une date est sélectionnée ou pour toutes les dates
  useEffect(() => {
    if (selectedDate) {
      fetchAvailableOptions(selectedDate);
    } else {
      // Pour "Toutes les dates", récupérer les options avec la première date disponible
      fetchAvailableOptions();
      // Récupérer tous les trains distincts pour ce trajet
      fetchAllTrainsForJourney();
    }
  }, [selectedDate, fetchAvailableOptions, fetchAllTrainsForJourney]);

  // Récupérer les trains pour "Toutes les dates" quand les dates sont disponibles
  useEffect(() => {
    if (!selectedDate && analysisDates.length > 0) {
      fetchAllTrainsForJourney();
    }
  }, [analysisDates, selectedDate, fetchAllTrainsForJourney]);

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
    calculatedStats,
    loading: false, // Ne plus utiliser le loading global
    filterLoading: shouldShowLinearLoader, // Utiliser l'indicateur linéaire
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
    applyFilters,
    currentFilters,
    handleDateSelect,
    handleTrainSelect,
    handleCarrierToggle,
    handleClassToggle,
    handleDiscountCardToggle,
    handleFlexibilityToggle,
  };
};
