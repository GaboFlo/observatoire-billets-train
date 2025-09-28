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
  const [loading, setLoading] = useState(true);
  const [filterLoading, setFilterLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysisDates, setAnalysisDates] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [availableTrains, setAvailableTrains] = useState<TrainInfo[]>([]);
  const [selectedTrain, setSelectedTrain] = useState<string | null>(null);
  const [selectedCarriers, setSelectedCarriers] = useState<string[]>([]);
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);
  const [selectedDiscountCards, setSelectedDiscountCards] = useState<string[]>(
    []
  );
  const [availableCarriers, setAvailableCarriers] = useState<string[]>([]);
  const [availableClasses, setAvailableClasses] = useState<string[]>([]);
  const [availableDiscountCards, setAvailableDiscountCards] = useState<
    string[]
  >([]);
  const [currentFilters, setCurrentFilters] = useState<JourneyDetailsFilters>({
    excludedCarriers: [],
    excludedClasses: [],
    excludedDiscountCards: [],
    selectedDates: [],
  });

  // Ref pour le debounce
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Fonction pour récupérer les dates disponibles
  const fetchAvailableDates = useCallback(async () => {
    try {
      console.log("📅 Récupération des dates disponibles");
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
      console.log("📅 Dates disponibles:", dates.length);
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
    }
  }, [departureStationId, arrivalStationId]);

  // Fonction pour récupérer les trains pour une date
  const fetchTrainsForDate = useCallback(
    async (date: string) => {
      try {
        console.log("🚂 Récupération des trains pour la date:", date);
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
        console.log("🚂 Trains disponibles:", trains.length);
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

  // Fonction pour récupérer les statistiques globales pour une date
  const fetchDateStatistics = useCallback(
    async (date: string) => {
      try {
        console.log("📊 Récupération des statistiques pour la date:", date);

        const response = await fetch("/api/trains/date-statistics", {
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
            `Erreur lors du chargement des statistiques: ${response.status}`
          );
        }

        const stats = await response.json();
        console.log("📊 Statistiques de la date:", stats);
        return stats;
      } catch (err) {
        console.error("❌ Erreur statistiques:", err);
        throw err;
      }
    },
    [departureStationId, arrivalStationId]
  );

  // Fonction pour récupérer les statistiques d'un train spécifique
  const fetchTrainStatistics = useCallback(
    async (trainNumber: string, date: string) => {
      try {
        console.log(
          "🚂📊 Récupération des statistiques pour le train:",
          trainNumber
        );

        const response = await fetch("/api/trains/train-statistics", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            departureStationId,
            arrivalStationId,
            date,
            trainNumber,
          }),
        });

        if (!response.ok) {
          throw new Error(
            `Erreur lors du chargement des statistiques du train: ${response.status}`
          );
        }

        const stats = await response.json();
        console.log("🚂📊 Statistiques du train:", stats);
        return stats;
      } catch (err) {
        console.error("❌ Erreur statistiques train:", err);
        throw err;
      }
    },
    [departureStationId, arrivalStationId]
  );

  const fetchJourneyDetails = useCallback(
    async (filters?: JourneyDetailsFilters) => {
      try {
        // Utiliser filterLoading pour éviter le rechargement complet
        if (journey && detailedOffers.length > 0) {
          setFilterLoading(true);
        } else {
          setLoading(true);
        }

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
        setError(null);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Une erreur est survenue"
        );
      } finally {
        setLoading(false);
        setFilterLoading(false);
      }
    },
    [departureStationId, arrivalStationId, journey, detailedOffers.length]
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

  // Chargement initial - récupérer les dates disponibles
  useEffect(() => {
    if (departureStation && arrivalStation) {
      console.log(
        "🚀 Chargement initial pour:",
        departureStation,
        "→",
        arrivalStation
      );

      // Réinitialiser l'état
      setSelectedDate(null);
      setAvailableTrains([]);
      setSelectedTrain(null);
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
    }
  }, [departureStation, arrivalStation, fetchAvailableDates]);

  // Fonctions de gestion des sélections
  const handleDateSelect = useCallback(
    (date: string) => {
      console.log("📅 Date sélectionnée:", date);
      setSelectedDate(date);
      setSelectedTrain(null); // Réinitialiser la sélection de train
      fetchTrainsForDate(date);
    },
    [fetchTrainsForDate]
  );

  const handleTrainSelect = useCallback((trainNumber: string) => {
    console.log("🚂 Train sélectionné:", trainNumber);
    setSelectedTrain(trainNumber);
  }, []);

  // Nouvelles fonctions de gestion des filtres
  const handleCarrierToggle = useCallback((carrier: string) => {
    setSelectedCarriers((prev) =>
      prev.includes(carrier)
        ? prev.filter((c) => c !== carrier)
        : [...prev, carrier]
    );
  }, []);

  const handleClassToggle = useCallback((travelClass: string) => {
    setSelectedClasses((prev) =>
      prev.includes(travelClass)
        ? prev.filter((c) => c !== travelClass)
        : [...prev, travelClass]
    );
  }, []);

  const handleDiscountCardToggle = useCallback((discountCard: string) => {
    setSelectedDiscountCards((prev) =>
      prev.includes(discountCard)
        ? prev.filter((c) => c !== discountCard)
        : [...prev, discountCard]
    );
  }, []);

  // Fonction pour récupérer les options disponibles (carriers, classes, discountCards)
  const fetchAvailableOptions = useCallback(
    async (date: string) => {
      try {
        console.log("🔍 Récupération des options disponibles pour:", date);

        const response = await fetch("/api/trains/date-statistics", {
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
            `Erreur lors du chargement des options: ${response.status}`
          );
        }

        const stats = await response.json();
        console.log("📊 Options disponibles:", stats);

        setAvailableCarriers(stats.carriers || []);
        setAvailableClasses(stats.classes || []);
        setAvailableDiscountCards(stats.discountCards || []);
      } catch (err) {
        console.error("❌ Erreur options:", err);
      }
    },
    [departureStationId, arrivalStationId]
  );

  // Fonction pour déclencher l'analyse avec les filtres actuels
  const triggerAnalysis = useCallback(async () => {
    if (!selectedDate) return;

    try {
      console.log("🔍 Déclenchement de l'analyse avec les filtres:", {
        selectedDate,
        selectedTrain,
        selectedCarriers,
        selectedClasses,
        selectedDiscountCards,
      });

      setFilterLoading(true);

      // Construire le body de la requête
      const requestBody: {
        departureStationId: number;
        arrivalStationId: number;
        date: string;
        trainNumber?: string;
        carriers?: string[];
        classes?: string[];
        discountCards?: string[];
      } = {
        departureStationId: departureStationId!,
        arrivalStationId: arrivalStationId!,
        date: selectedDate,
      };

      // Ajouter les filtres seulement s'ils sont sélectionnés
      if (selectedTrain) {
        requestBody.trainNumber = selectedTrain;
      }
      if (selectedCarriers.length > 0) {
        requestBody.carriers = selectedCarriers;
      }
      if (selectedClasses.length > 0) {
        requestBody.classes = selectedClasses;
      }
      if (selectedDiscountCards.length > 0) {
        requestBody.discountCards = selectedDiscountCards;
      }

      console.log("📤 Envoi de la requête d'analyse:", requestBody);

      // Appeler l'endpoint d'analyse (à créer)
      const response = await fetch("/api/trains/analysis", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`Erreur lors de l'analyse: ${response.status}`);
      }

      const analysisResult = await response.json();
      console.log("📊 Résultat de l'analyse:", analysisResult);

      // Mettre à jour les données avec le résultat de l'analyse
      // Ici on pourrait mettre à jour journey, detailedOffers, etc.
    } catch (err) {
      console.error("❌ Erreur analyse:", err);
      setError(err instanceof Error ? err.message : "Erreur lors de l'analyse");
    } finally {
      setFilterLoading(false);
    }
  }, [
    selectedDate,
    selectedTrain,
    selectedCarriers,
    selectedClasses,
    selectedDiscountCards,
    departureStationId,
    arrivalStationId,
  ]);

  // Déclencher l'analyse avec debounce quand les filtres changent
  useEffect(() => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    debounceTimeoutRef.current = setTimeout(() => {
      triggerAnalysis();
    }, 400);
  }, [triggerAnalysis]);

  // Récupérer les options disponibles quand une date est sélectionnée
  useEffect(() => {
    if (selectedDate) {
      fetchAvailableOptions(selectedDate);
    }
  }, [selectedDate, fetchAvailableOptions]);

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
    selectedDate,
    availableTrains,
    selectedTrain,
    selectedCarriers,
    selectedClasses,
    selectedDiscountCards,
    availableCarriers,
    availableClasses,
    availableDiscountCards,
    applyFilters,
    currentFilters,
    handleDateSelect,
    handleTrainSelect,
    handleCarrierToggle,
    handleClassToggle,
    handleDiscountCardToggle,
    fetchDateStatistics,
    fetchTrainStatistics,
  };
};
