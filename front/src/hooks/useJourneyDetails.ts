import { DetailedPricingResult, GroupedJourney } from "@/types/journey";
import { useCallback, useEffect, useRef, useState } from "react";

interface JourneyDetailsFilters {
  carriers: string[];
  classes: string[];
  discountCards: string[];
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
    carriers: [],
    classes: [],
    discountCards: ["MAX"],
    selectedDates: [],
    departureStationId,
    arrivalStationId,
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
    async (date: string, trainNumber?: string) => {
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
            trainNumber: trainNumber || null,
            carriers: [],
            classes: [],
            discountCards: ["MAX"], // Toujours inclure MAX par défaut
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

  // fetchJourneyDetails ne doit dépendre que des IDs de stations pour éviter les boucles infinies
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
          carriers: filters?.carriers || [],
          classes: filters?.classes || [],
          discountCards: filters?.discountCards || [],
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

        console.log("🔄 Mise à jour des données journey:", {
          minPrice: journeyData.minPrice,
          avgPrice: journeyData.avgPrice,
          maxPrice: journeyData.maxPrice,
          carriers: journeyData.carriers,
          classes: journeyData.classes,
          discountCards: journeyData.discountCards,
        });

        setJourney(journeyData);
        setDetailedOffers(data);

        // Mettre à jour les filtres actuels seulement si des filtres sont fournis
        if (filters) {
          setCurrentFilters({
            carriers: filters.carriers || [],
            classes: filters.classes || [],
            discountCards: filters.discountCards || [],
            selectedDates: filters.selectedDates || [],
            departureStationId: filters.departureStationId,
            arrivalStationId: filters.arrivalStationId,
            trainNumber: filters.trainNumber,
          });
        }

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
    [departureStationId, arrivalStationId]
  );

  // Fonction pour appliquer les filtres avec debounce

  // applyFilters ne doit dépendre que de fetchJourneyDetails pour éviter les boucles infinies
  const applyFilters = useCallback(
    (newFilters: Partial<JourneyDetailsFilters>) => {
      console.log("🔧 applyFilters appelé avec:", newFilters);

      // Annuler le timeout précédent
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }

      // Créer les nouveaux filtres en cumulant avec les filtres actuels
      const updatedFilters = {
        ...currentFilters,
        ...newFilters,
      };

      console.log("🔧 Filtres mis à jour:", updatedFilters);
      setCurrentFilters(updatedFilters);

      // Débouncer l'appel à l'API
      debounceTimeoutRef.current = setTimeout(() => {
        console.log(
          "🔧 Déclenchement de fetchJourneyDetails avec:",
          updatedFilters
        );
        fetchJourneyDetails(updatedFilters);
      }, 400); // 0.4 secondes de debounce
    },
    [fetchJourneyDetails]
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

      // Charger les données initiales avec les IDs de stations
      // Utiliser des filtres explicites pour éviter la boucle infinie avec currentFilters
      fetchJourneyDetails({
        carriers: [],
        classes: [],
        discountCards: ["MAX"],
        selectedDates: [],
        departureStationId,
        arrivalStationId,
      });
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
        ? selectedClasses.filter((c) => c !== travelClass)
        : [...selectedClasses, travelClass];

      setSelectedClasses(newSelectedClasses);

      // Déclencher un appel API avec les nouveaux filtres
      // Maintenant on passe directement les classes sélectionnées
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
            trainNumber: null,
            carriers: [],
            classes: [],
            discountCards: ["MAX"],
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
    try {
      console.log("🔍 Déclenchement de l'analyse avec les filtres:", {
        selectedDate,
        selectedTrain,
        selectedCarriers,
        selectedClasses,
        selectedDiscountCards,
      });

      setFilterLoading(true);

      let analysisResult;

      if (!selectedDate) {
        // Cas 1: Aucune date sélectionnée - Statistiques générales sur le trajet
        console.log("📊 Analyse générale du trajet");
        const response = await fetch("/api/trains/pricing", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            excludedCarriers: [],
            excludedClasses: [],
            excludedDiscountCards: [],
            selectedDates: [],
          }),
        });

        if (!response.ok) {
          throw new Error(
            `Erreur lors de l'analyse générale: ${response.status}`
          );
        }

        const generalData = await response.json();
        console.log("📊 Données générales:", generalData);

        // Trouver les données pour ce trajet spécifique
        const journeyData = generalData.find(
          (item: any) =>
            item.departureStationId === departureStationId &&
            item.arrivalStationId === arrivalStationId
        );

        analysisResult = journeyData || {
          totalOffers: 0,
          minPrice: 0,
          maxPrice: 0,
          avgPrice: 0,
          carriers: [],
          classes: [],
          discountCards: [],
          totalTrains: 0,
        };
      } else if (!selectedTrain) {
        // Cas 2: Date sélectionnée mais pas de train - Statistiques de la date
        console.log("📊 Analyse de la date:", selectedDate);
        const response = await fetch("/api/trains/date-statistics", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            departureStationId,
            arrivalStationId,
            date: selectedDate,
            trainNumber: null,
            carriers: selectedCarriers,
            classes: selectedClasses,
            discountCards: selectedDiscountCards,
          }),
        });

        if (!response.ok) {
          throw new Error(
            `Erreur lors de l'analyse de date: ${response.status}`
          );
        }

        analysisResult = await response.json();
        console.log("📊 Statistiques de la date:", analysisResult);
      } else {
        // Cas 3: Date ET train sélectionnés - Analyse spécifique du train
        console.log("📊 Analyse du train spécifique:", selectedTrain);
        const response = await fetch("/api/trains/train-statistics", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            departureStationId,
            arrivalStationId,
            date: selectedDate,
            trainNumber: selectedTrain,
          }),
        });

        if (!response.ok) {
          throw new Error(
            `Erreur lors de l'analyse du train: ${response.status}`
          );
        }

        analysisResult = await response.json();
        console.log("📊 Statistiques du train:", analysisResult);
      }

      // Mettre à jour les données avec le résultat de l'analyse
      if (analysisResult) {
        // Mettre à jour l'objet journey avec les nouvelles statistiques
        setJourney((prev) =>
          prev
            ? {
                ...prev,
                minPrice: analysisResult.minPrice || 0,
                maxPrice: analysisResult.maxPrice || 0,
                avgPrice: analysisResult.avgPrice || 0,
              }
            : null
        );
      }
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
