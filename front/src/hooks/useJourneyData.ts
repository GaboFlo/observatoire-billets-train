import { useCallback, useEffect, useRef, useState } from "react";
import { buildApiUrl } from "../config/api";
import datesData from "../data/dates.json";
import { GroupedJourney } from "../types/journey";
import { saveFilters } from "../utils/filterStorage";

export type Journey = GroupedJourney;

const FILTER_DEBOUNCE_DELAY = 300;

interface JourneyFilters {
  carriers?: string[];
  classes?: string[];
  discountCards?: string[];
  flexibilities?: string[];
  selectedDates?: string[];
}

interface ApiResponseItem {
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
}

const createDummyOffers = (item: ApiResponseItem) => {
  const offers = [];
  for (const carrier of item.carriers) {
    for (const travelClass of item.classes) {
      for (const discountCard of item.discountCards) {
        const flexibilities = item.flexibilities ?? [];
        for (const flexibility of flexibilities) {
          offers.push({
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
          });
        }
      }
    }
  }
  return offers;
};

const createJourneyFromItem = (item: ApiResponseItem): Journey => {
  const journeyId = `${item.departureStation}-${item.arrivalStation}`;
  return {
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
    offers: createDummyOffers(item),
  };
};

const buildRequestBody = (filters?: JourneyFilters) => {
  return {
    carriers: filters?.carriers ?? [],
    classes: filters?.classes ?? [],
    discountCards: filters?.discountCards ?? ["NONE"],
    flexibilities: filters?.flexibilities ?? [],
    selectedDates: filters?.selectedDates ?? [],
  };
};

export const useJourneyData = () => {
  const [journeys, setJourneys] = useState<Journey[]>([]);
  const [allJourneys, setAllJourneys] = useState<Journey[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterLoading, setFilterLoading] = useState(false);
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

  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const filterLoadingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const determineLoadingState = useCallback(() => {
    const hasLoadedBefore =
      sessionStorage.getItem("journeys-loaded") === "true";
    const hasExistingData = journeys.length > 0 || allJourneys.length > 0;
    return hasExistingData || hasLoadedBefore;
  }, [journeys.length, allJourneys.length]);

  const processApiData = useCallback((data: ApiResponseItem[]): Journey[] => {
    const journeyMap = new Map<string, Journey>();
    for (const item of data) {
      const journey = createJourneyFromItem(item);
      journeyMap.set(journey.id, journey);
    }
    return Array.from(journeyMap.values());
  }, []);

  const fetchJourneys = useCallback(
    async (filters?: JourneyFilters) => {
      try {
        const shouldUseFilterLoading = determineLoadingState();
        if (shouldUseFilterLoading) {
          setFilterLoading(true);
        } else {
          setLoading(true);
          sessionStorage.setItem("journeys-loaded", "true");
        }

        const requestBody = buildRequestBody(filters);
        const response = await fetch(buildApiUrl("/api/trains/pricing"), {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: ApiResponseItem[] = await response.json();
        const processedJourneys = processApiData(data);
        setJourneys(processedJourneys);

        const isFirstLoad =
          allJourneys.length === 0 && processedJourneys.length > 0;
        if (isFirstLoad) {
          setAllJourneys(processedJourneys);
        }

        const newFilters = buildRequestBody(filters);
        setCurrentFilters(newFilters);
        saveFilters(newFilters);
        setError(null);
      } catch (err) {
        console.error("Erreur lors de la récupération des données:", err);
        setError(err instanceof Error ? err.message : "Erreur inconnue");
      } finally {
        setLoading(false);
        if (filterLoadingTimeoutRef.current) {
          clearTimeout(filterLoadingTimeoutRef.current);
        }
        filterLoadingTimeoutRef.current = setTimeout(() => {
          setFilterLoading(false);
        }, FILTER_DEBOUNCE_DELAY);
      }
    },
    [determineLoadingState, processApiData, allJourneys.length]
  );

  useEffect(() => {
    if (!datesLoaded) {
      setAnalysisDates(datesData);
      setDatesLoaded(true);
    }
  }, [datesLoaded]);

  const applyFilters = useCallback(
    (newFilters: JourneyFilters) => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }

      const updatedFilters = {
        ...currentFilters,
        carriers: newFilters.carriers ?? currentFilters.carriers,
        classes: newFilters.classes ?? currentFilters.classes,
        discountCards: newFilters.discountCards ?? currentFilters.discountCards,
        flexibilities: newFilters.flexibilities ?? currentFilters.flexibilities,
        selectedDates: newFilters.selectedDates ?? currentFilters.selectedDates,
      };

      setFilterLoading(true);

      debounceTimeoutRef.current = setTimeout(() => {
        fetchJourneys(updatedFilters);
      }, FILTER_DEBOUNCE_DELAY);
    },
    [currentFilters, fetchJourneys]
  );

  const handleDateSelect = useCallback(
    (dates: string[]) => {
      setSelectedDates(dates);
      applyFilters({ selectedDates: dates });
    },
    [applyFilters]
  );

  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
      if (filterLoadingTimeoutRef.current) {
        clearTimeout(filterLoadingTimeoutRef.current);
      }
    };
  }, []);

  return {
    journeys,
    allJourneys,
    loading,
    filterLoading,
    error,
    analysisDates,
    selectedDates,
    handleDateSelect,
    fetchJourneys,
    applyFilters,
    currentFilters,
  };
};
